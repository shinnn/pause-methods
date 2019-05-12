import assert from 'assert';

import pauseMethods from '.';
import test from 'testit';

const {deepEqual, equal, throws} = assert.strict;

let i = 0;

const obj = {
	x(...args) {
		for (const arg of args) {
			i += arg;
		}

		return i;
	},
	z: 'Hi'
};

Object.defineProperty(obj, 'y', {
	value() {
		return 'not enumerable';
	}
});

test('pauseMethods()', () => {
	test('should return the original object', () => {
		equal(pauseMethods(obj), obj);
	});

	test('should let the object methods return `undefined`', () => {
		equal(obj.x(1), undefined);
	});

	test('should let the object methods do nothing', () => {
		equal(i, 0);
	});

	test('should handle multiple arguments of methods', () => {
		equal(obj.x(2, 3), undefined);
	});

	test('should leave non-enumerable methods as is', () => {
		equal(obj.y(), 'not enumerable');
	});

	test('should throw an error when it takes a non-object value', () => {
		throws(
			() => pauseMethods(-0),
			/^TypeError: Expected an <Object>, but got a non-object value -0 \(number\)\./u
		);
	});

	test('should throw an error when it takes an already paused object', () => {
		throws(
			() => pauseMethods(obj),
			/^Error: Expected an <Object> which hasn't been paused by `pauseMethods\(\)` yet, but got an already paused one \{.*\}\./u
		);
	});

	test('should throw an error when it takes no arguments', () => {
		throws(
			() => pauseMethods(),
			/^RangeError: Expected 1 argument \(<Function>\), but got no arguments\./u
		);
	});

	test('should throw an error when it takes too many arguments', () => {
		throws(
			() => pauseMethods({}, {}),
			/^RangeError: Expected 1 argument \(<Function>\), but got 2 arguments\./u
		);
	});
});

test('pauseMethods.resume()', () => {
	test('should return the original object', () => {
		deepEqual(pauseMethods.resume(obj), obj,);
	});

	test('should throw an error when it takes a non-object argument', () => {
		throws(
			() => pauseMethods.resume(Symbol('a')),
			/^TypeError: Expected an <Object>, but got a non-object value Symbol\(a\)\./u
		);
	});

	test('should throw an error when it takes an already resumed object', () => {
		throws(
			() => pauseMethods.resume(obj),
			/^Error: Expected an <Object> whose methods are paused by `pauseMethods\(\)`, but got an already resume\(\)-ed one \{.*\}*\./u
		);
	});

	test('should throw an error when it takes an object that hasn\'t been paused', () => {
		throws(
			() => pauseMethods.resume({}),
			/^Error: Expected an <Object> whose methods are paused by `pauseMethods\(\)`, but got \{\} \(object\) which is not paused by `pauseMethods\(\)`\./u
		);
	});

	test('should throw an error when it takes no arguments.', () => {
		throws(
			() => pauseMethods.resume(),
			/^RangeError: Expected 1 argument \(<Function>\), but got no arguments\./u
		);
	});

	test('should throw an error when it takes too many arguments', () => {
		throws(
			() => pauseMethods.resume({}, {}),
			/^RangeError: Expected 1 argument \(<Function>\), but got 2 arguments\./u
		);
	});
});

test('pauseMethods.pause()', () => {
	test('should be an alias of `pauseMethods()`', () => {
		equal(pauseMethods.pause, pauseMethods);
	});
});
