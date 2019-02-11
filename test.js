'use strict';

const pauseMethods = require('.');
const test = require('tape');

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

test('pauseMethods()', async t => {
	t.equal(
		pauseMethods(obj),
		obj,
		'should return the original object.'
	);

	t.equal(
		obj.x(1),
		undefined,
		'should let the object methods return `undefined`.'
	);

	t.equal(
		i,
		0,
		'should let the object methods do nothing.'
	);

	t.equal(
		obj.x(2, 3),
		undefined,
		'should handle multiple arguments of methods.'
	);

	t.equal(
		obj.y(),
		'not enumerable',
		'should leave non-enumerable methods as is.'
	);

	t.throws(
		() => pauseMethods(-0),
		/^TypeError: Expected an <Object>, but got a non-object value -0 \(number\)\./u,
		'should throw an error when it takes a non-object value.'
	);

	t.throws(
		() => pauseMethods(obj),
		/^Error: Expected an <Object> which hasn't been paused by `pauseMethods\(\)` yet, but got an already paused one \{.*\}\./u,
		'should throw an error when it takes an already paused object.'
	);

	t.throws(
		() => pauseMethods(),
		/^TypeError: Expected an <Object>, but got a non-object value undefined\./u,
		'should throw an error when it takes no arguments.'
	);

	t.end();
});

test('pauseMethods.resume()', async t => {
	t.deepEqual(
		pauseMethods.resume(obj),
		obj,
		'should return the original object.'
	);

	t.throws(
		() => pauseMethods.resume(Symbol('a')),
		/^TypeError: Expected an <Object>, but got a non-object value Symbol\(a\)\./u,
		'should throw an error when it takes a non-object argument.'
	);

	t.throws(
		() => pauseMethods.resume(obj),
		/^Error: Expected an <Object> whose methods are paused by `pauseMethods\(\)`, but got an already resume\(\)-ed one \{.*\}*\./u,
		'should throw an error when it takes an already resumed object.'
	);

	t.throws(
		() => pauseMethods.resume({}),
		/^Error: Expected an <Object> whose methods are paused by `pauseMethods\(\)`, but got \{\} \(object\) which is not paused by `pauseMethods\(\)`\./u,
		'should throw an error when it takes an object that hasn\'t been paused.'
	);

	t.throws(
		() => pauseMethods.resume(),
		/^TypeError: Expected an <Object>, but got a non-object value undefined\./u,
		'should throw an error when it takes no arguments.'
	);

	t.end();
});

test('pauseMethods.pause()', async t => {
	t.equal(
		pauseMethods.pause,
		pauseMethods,
		'should be an alias of `pauseMethods()`.'
	);

	t.end();
});
