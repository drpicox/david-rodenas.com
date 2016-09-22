---
title: "Rollup vs Webpack2 and tree shaking"
tags:
  - npm
  - build
  - bundle
  - es2015
  - rollup
  - webpack
  - tree-shaking
date: 2016-09-22
abstract: >
    Rollup introduced tree-shaking in the bundle creation process.
    Recently, webpack 2 added tree shanking to its bundle generation.
    But both processes are substantially different.
    In this post both generated code will be compared 
    and conclussions shown. 
snippet: |
    ```bash
    $ rollup entry.js > rollup-bundle.js 
    $ webpack entry.js webpack-bundle.js 
    ```
---

Tree-shaking is a technique based in ES2015 definition modules
that allows to remove everything that it is not used from the module.

Given the following example:

```javascript
// entry.js
import { nextPage, currentPage } from './barrel';

console.log('before:', currentPage);
nextPage();
console.log('after:', currentPage);
```

```javascript
// barrel.js
export * from './pager';
```

```javascript
// pager.js
export var currentPage = 0;

export function nextPage() {
	currentPage++;
}

export function prevPage() {
	currentPage--;
}
```

We can see that `pager.js` is exporting three 
symbols: _currentPage_, _nextPage_, and _prevPage_.

If we look carefully to `entry.js` we see that only
symbols _currentPage_ and _nextPage_ are in use.
In this application _prevPage_ is not used.

Tree-shaking analyses all imports and exports of an application
and removes all symbols that are unused. 
In this case _prevPage_ dissapears from the bundle.


### Rollup

Rollup not only does tree-shaking, 
but also hoists all modules into a single scope.
That means that there are no need for new function closures.

The code through _rollup_ is like the following:

```javascript
// rollup-bundle.unminimized.js
var currentPage = 0;

function nextPage() {
	currentPage++;
}

console.log('before:', currentPage);
nextPage();
console.log('after:', currentPage);
```

It is just the code that it is being used by the app.
Once it is minimized it looks like:

```javascript
function o() { n++ }
var n = 0;
console.log("before:", n), o(), console.log("after:", n)
```


### Webpack

Webpack uses the traditional approach of
giving a closure function to each module
and it only applies tree-shaking 
during the minimization process.

The code through _webpack_ including minimization looks like the following:

```javascript
! function(n) {
  // .. omitted webpack loader ..
}([function(n, t, r) {
    "use strict";
    var e = r(1);
    r.d(t, "a", function() {
        return e.a
    }), r.d(t, "b", function() {
        return e.b
    })
}, function(n, t, r) {
    "use strict";

    function e() { o++ }
    r.d(t, "a", function() {
        return o
    }), t.b = e;
    var o = 0
}, function(n, t, r) {
    "use strict";
    var e = r(0);
    console.log("before:", e.a), r.i(e.b)(), console.log("after:", e.a)
}]);
```


### Variables

Variables defined inside modules and exported must have consistent values
across all imports.
That means that any change to a variable it has to be visible through all modules.

I test it with the `currentPage` variable, 
which is modified inside the _pager.js_ module
but read from the _entry.js_ module.

Rollup achieves this behaviour by just sharing the same scope:
any function can access directly to the shared variable.

Webpack has a problem: because variables are attached to `exports` objects
it have problems to be consistent. In order to achieve this consistency
webpack uses javascript computed properties:

```javascript
// the loader defines this helper function:
t.d = function(n, t, r) {
  Object.defineProperty(n, t, { configurable: !1, enumerable: !0, get: r });
};
// each module creates a computed property to export a variable:
r.d(t, "a", function() {
  return o;
});
```


### Barrels

Barrels are aggregators of functionalities of one package or library.
It makes possible to export all symbols through one single point.

```javascript
export * from './pager.js`;
```

Rollup makes them disappear. 
They do not have meaning by themselves, 
they are a simple shortcut.

Webpack exports them into the bundle:

```javascript
function(n, t, r) {
    "use strict";
    var e = r(1);
    r.d(t, "a", function() {
        return e.a
    }), r.d(t, "b", function() {
        return e.b
    })
},
```


### Constants

It is common to export constants.
They have many uses and are opened for many optimizations,
both from minimization and from jit compiling.

Given the following example:

```javascript
// entry.js
import { nextPage, currentPage, pageCount, getDocumentSize } from './barrel';

if (pageCount > 10) {
	console.log('document size:', getDocumentSize());
}

console.log('before:', currentPage);
nextPage();
console.log('after:', currentPage);
```

```javascript
// barrel.js
export * from './pager';
```

```javascript
// pager.js
export const pageCount = 4;
export var currentPage = 0;

export function getDocumentSize() {
	return pageCount * 80 * 60;
}

export function nextPage() {
	currentPage++;
}

export function prevPage() {
	currentPage--;
}
```

Note that because `pageCount` is `4`
it will always less than 10 and all
new code is never executed.

The rollup generated and minimized code
is exactly the same as before.
Minimization process realizes that the condition
is always false, removes the code,
and then realises that `getDocumentSize`
is never used and removes them. 

The webpack generated and minimized code changes,
it is the following:

```javascript
! function(n) {
    // .. omitted webpack loader ..
}([function(n, t, r) {
    "use strict";
    var e = r(1);
    r.d(t, "a", function() {
        return e.a
    }), r.d(t, "b", function() {
        return e.b
    }), r.d(t, "c", function() {
        return e.c
    }), r.d(t, "d", function() {
        return e.d
    })
}, function(n, t, r) {
    "use strict";

    function e() {
        return 19200
    }

    function o() { c++ }
    r.d(t, "c", function() {
        return c
    }), t.b = e, t.d = o;
    const u = 4;
    t.a = u;
    var c = 0
}, function(n, t, r) {
    "use strict";
    var e = r(0);
    e.a > 10 && console.log("document size:", r.i(e.b)()), console.log("before:", e.c), r.i(e.d)(), console.log("after:", e.c)
}]);
```

It is unable to minimize the code because the value of the constant
is returned by a computed property inside an object.
Because of it tree-shaking and dead code elimination cannot remove 
`getDocumentSize` function.

### Conclusion and Review

The initial version gave the following numbers:

| Tool     | minimized | gzipped   |
| -------- | --------: | --------: |
| RollupJS | 108 bytes |  94 bytes |
| Webpack  | 793 bytes | 393 bytes |
| Webpack (without loader) | 325 bytes | 177 bytes |

A version without loader has been constructed manually because
the overhead of the loader is constant regardless the size of the bundle.
Although both tools perform the same basic optimization,
rollup **scope hoisting gives an important improvement** 
in the bundle size. 

Considering the version using constants the difference gets larger,
but it is because the strategy of webpack does not allows to perform
extra optimization.

| Tool     | minimized | gzipped   |
| -------- | --------: | --------: |
| RollupJS | 108 bytes |  94 bytes |
| Webpack  | 958 bytes | 454 bytes |
| Webpack (without loader) | 490 bytes | 238 bytes |

Something important that has to be also considered is the use of 
_computed properties_ by webpack for exported variables or constants. 
Using this exported symbols my cause an overhead in runtime execution time:
each time that they are accessed they are accessed through an object
and a function.


### More information

See:
- Code example: https://github.com/drpicox/rollup-vs-webpack/tree/basic
- Code example with constants: https://github.com/drpicox/rollup-vs-webpack/tree/with-constants
- Barrel: https://angular.io/docs/ts/latest/guide/glossary.html#!#barrel 
