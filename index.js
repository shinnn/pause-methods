'use strict';

const inspect = require('util').inspect;

const inspectWithKind = require('inspect-with-kind');
const pauseFn = require('pause-fn');

const PAUSE_ERROR = 'Expected an <Object> whose methods are paused by `pauseMethods()`';
const pausedObjMethodsMap = new WeakMap();
const resumed = new Set();

module.exports = function pauseMethods(obj) {
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

	Object.keys(obj).forEach(key => {
		const propertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);
		const value = propertyDescriptor.value;
		const writable = propertyDescriptor.writable;

		if (typeof value !== 'function' || !writable) {
			return;
		}

		methods.set(key, value);
		obj[key] = pauseFn(value.bind(obj));
	});
	pausedObjMethodsMap.set(obj, methods);
	resumed.delete(obj);

	return obj;
};

Object.defineProperty(module.exports, 'pause', {
	enumerable: true,
	value: module.exports
});

Object.defineProperty(module.exports, 'resume', {
	enumerable: true,
	value: function resume(obj) {
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

		pausedObjMethodsMap.get(obj).forEach((value, key) => {
			pauseFn.resume(obj[key]);
			obj[key] = value;
		});
		resumed.add(obj);

		return obj;
	}
});
