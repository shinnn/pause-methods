'use strict';

const {inspect} = require('util');

const inspectWithKind = require('inspect-with-kind');
const pauseFn = require('pause-fn');

const ARG_ERROR = 'Expected 1 argument (<Function>)';
const PAUSE_ERROR = 'Expected an <Object> whose methods are paused by `pauseMethods()`';
const pausedObjMethodsMap = new WeakMap();
const resumed = new WeakSet();

function validateArgumentLength(args) {
	const argLen = args.length;

	if (argLen === 0) {
		const error = new RangeError(`${ARG_ERROR}, but got no arguments.`);

		error.code = 'ERR_MISSING_ARGS';
		Error.captureStackTrace(error, pauseMethods);
		Error.captureStackTrace(error, resume);
		throw error;
	}

	if (argLen !== 1) {
		const error = new RangeError(`${ARG_ERROR}, but got ${argLen} arguments.`);

		error.code = 'ERR_TOO_MANY_ARGS';
		Error.captureStackTrace(error, pauseMethods);
		Error.captureStackTrace(error, resume);
		throw error;
	}
}

function pauseMethods(...args) {
	validateArgumentLength(args);

	const [obj] = args;

	if (obj === null || typeof obj !== 'object') {
		const error = new TypeError(`Expected an <Object>, but got a non-object value ${inspectWithKind(obj)}.`);
		error.code = 'ERR_INVALID_ARG_TYPE';

		throw error;
	}

	if (pausedObjMethodsMap.has(obj)) {
		const error = new Error(`Expected an <Object> which hasn't been paused by \`pauseMethods()\` yet, but got an already paused one ${inspect(obj, {breakLength: Infinity})}.`);
		error.code = 'ERR_INVALID_ARG_ALUE';

		throw error;
	}

	const methods = new Map();

	for (const key of Object.keys(obj)) {
		const {value, writable} = Reflect.getOwnPropertyDescriptor(obj, key);

		if (typeof value !== 'function' || !writable) {
			continue;
		}

		methods.set(key, value);
		obj[key] = pauseFn(value.bind(obj));
	}

	pausedObjMethodsMap.set(obj, methods);
	resumed.delete(obj);

	return obj;
}

function resume(...args) {
	validateArgumentLength(args);

	const [obj] = args;

	if (obj === null || typeof obj !== 'object') {
		const error = new TypeError(`Expected an <Object>, but got a non-object value ${inspectWithKind(obj)}.`);
		error.code = 'ERR_INVALID_ARG_TYPE';

		throw error;
	}

	if (resumed.has(obj)) {
		const error = new Error(`${PAUSE_ERROR}, but got an already resume()-ed one ${inspect(obj, {breakLength: Infinity})}.`);
		error.code = 'ERR_INVALID_ARG_VALUE';

		throw error;
	}

	if (!pausedObjMethodsMap.has(obj)) {
		const error = new Error(`${PAUSE_ERROR}, but got ${inspectWithKind(obj, {breakLength: Infinity})} which is not paused by \`pauseMethods()\`.`);
		error.code = 'ERR_INVALID_ARG_VALUE';

		throw error;
	}

	for (const [key, value] of pausedObjMethodsMap.get(obj)) {
		pauseFn.resume(obj[key]);
		obj[key] = value;
	}

	resumed.add(obj);

	return obj;
}

module.exports = pauseMethods;

Object.defineProperties(module.exports, {
	pause: {
		enumerable: true,
		value: module.exports
	},
	resume: {
		enumerable: true,
		value: resume
	}
});
