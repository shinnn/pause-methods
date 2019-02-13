# pause-methods

[![npm version](https://img.shields.io/npm/v/pause-methods.svg)](https://www.npmjs.com/package/pause-methods)
[![Build Status](https://travis-ci.com/shinnn/pause-methods.svg?branch=master)](https://travis-ci.com/shinnn/pause-methods)
[![codecov](https://codecov.io/gh/shinnn/pause-methods/branch/master/graph/badge.svg)](https://codecov.io/gh/shinnn/pause-methods)

A [Node.js](https://nodejs.org/) module to pause/resume execution of the object's methods

```javascript
const {pause, resume} = require('pause-methods');

const obj = {
  methodA() {
    process.stdout.write('hello');
  },
  methodB() {
    process.stdout.write('world');
  }
};
const pausedObj = pause(obj);

pausedObj.methodA(); // prints nothing
pausedObj.methodB(); // prints nothing

resume(pausedObj); // prints 'hello' and 'world'
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install pause-methods
```

## API

```javascript
const pauseMethods = require('pause-methods');
```

### pauseMethods(*obj*)

*obj*: `Object`  
Return: `Object` (a reference to *obj*)

It makes *obj*'s [enumerable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) `Function` properties do nothing and return `undefined`.

```javascript
let num = 0;
const obj = {countUp: () => ++num};

obj.countUp(); //=> 1
num; //=> 1

const pausedObj = pauseFn(obj);

pausedObj.countUp(); //=> undefined, not 2
num; //=> 1, not 2

pausedObj.countUp(); //=> undefined
pausedObj.countUp(); //=> undefined
pausedObj.countUp(); //=> undefined
// ...
num; //=> 1
```

### pauseMethods.pause(*obj*)

An alias of [`pauseMethods()`](#pausemethodsobj).

### pauseMethods.resume(*obj*)

*obj*: `Object` returned by [`pauseMethods()`](#pausemethodsobj)  
Return: `Object` (a reference to *obj*)

It restores the original functionality of the paused methods, calls it with each arguments passed while paused.

```javascript
const pausedFs = pauseMethods(fs.promises);

(async () => {
  await pausedFs.writeFile('./a', 'foo'); // ./a is not created here
  await pausedFs.mkdir('./b'); // ./b is not created here

  pauseFs.resume(); // ./a and ./b are created here
})();
```

## License

[ISC License](./LICENSE) © 2019 Shinnosuke Watanabe
