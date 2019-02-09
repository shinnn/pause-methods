'use strict';

var inspect = require('util').inspect;

var appendType = require('append-type');
var pauseFn = require('pause-fn');

var PAUSE_ERROR = 'Expected an <Object> whose methods are paused by `pauseMethods()`';
var pausedObjMethodsMap = new WeakMap();
var resumed = new Set();

module.exports = function pauseMethods(obj) {
	if (obj === null || typeof obj !== 'object') {
		var error0 = new TypeError('Expected an <Object>, but got a non-object value ' + appendType(obj) + '.');
		error0.code = 'ERR_INVALID_ARG_TYPE';

		throw error0;
	}

	if (pausedObjMethodsMap.has(obj)) {
		var error1 = new Error('Expected an <Object> which hasn\'t been paused by `pauseMethods()` yet, but got an already paused one ' + inspect(obj, {breakLength: Infinity}) + '.');
		error1.code = 'ERR_INVALID_ARG_ALUE';

		throw error1;
	}

	var methods = new Map();

	Object.keys(obj).forEach(function(key) {
		var propertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);
		var value = propertyDescriptor.value;
		var writable = propertyDescriptor.writable;

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
			var error = new TypeError('Expected an <Object>, but got a non-object value ' + appendType(obj) + '.');
			error.code = 'ERR_INVALID_ARG_TYPE';

			throw error;
		}

		if (resumed.has(obj)) {
			var error1 = new Error(PAUSE_ERROR + ', but got an already resume()-ed one ' + inspect(obj, {breakLength: Infinity}) + '.');
			error1.code = 'ERR_INVALID_ARG_VALUE';

			throw error1;
		}

		if (!pausedObjMethodsMap.has(obj)) {
			var error2 = new Error(PAUSE_ERROR + ', but got ' + inspect(obj, {breakLength: Infinity}) + ' which is not paused by `pauseMethods()`.');
			error2.code = 'ERR_INVALID_ARG_VALUE';

			throw error2;
		}

		pausedObjMethodsMap.get(obj).forEach(function(value, key) {
			pauseFn.resume(obj[key]);
			obj[key] = value;
		});
		resumed.add(obj);

		return obj;
	}
});
