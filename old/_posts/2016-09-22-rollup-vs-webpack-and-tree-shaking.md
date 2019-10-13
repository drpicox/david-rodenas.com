---
title: "Rollup vs Webpack2 and tree shaking"
tags:
  - npm
  - build
  - bundle
  - es2015
  - rollup
  - webpack
  - scope-hoisting
  - tree-shaking
date: 2016-09-22
description: >
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

Tree-shaking is lukig a technique based in ES2015 definition modules
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


## Rollup

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


## Webpack

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


## Variables

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


## Barrels

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


## Comparison

In overall, output sizes results are the following:

| Tool     | minimized | gzipped   |
| -------- | --------: | --------: |
| RollupJS | 108 bytes |  94 bytes |
| Webpack  | 793 bytes | 393 bytes |
| Webpack (without loader) | 325 bytes | 177 bytes |

Webpack loader size is constant regardless the size of the bundle,
that means that it is an overhead that does not worth to consider.

Although there are important differences in bundle sizes 
(rollup generated size is almost a half from the best of webpack)
there are other important points:

- getters: webpack creates a getter for each variable export,
  that means, that we, programmers, are
  penalised for each export that we build, larger export chain
  larger number of getters and more functions to execute each time
  that we get a value,

- barrels: barrels are just "syntax sugar" for the programmer,
  we use them to make the code easier to manage, 
  they have no meaning by themselves in the application bundle,
  but webpack creates a closure and export object for each one,
  which penalizes us, as programmers, for using them.


## Conclusion

_Scope-hoisting_ strategy of rollup gives a very good results: it
makes barrels disappear completely and it requires no getters to 
implement the ES2015 semantics when exporting variables.

As overall although webpack 2 implements tree-shaking it fails
implementing the objective of doing tree-shaking: 
remove all unused code and let the programmer express itself
as it needs to have a maintainable code.



## More information

See:
- Code example: https://github.com/drpicox/rollup-vs-webpack/tree/basic
- Barrel: https://angular.io/docs/ts/latest/guide/glossary.html#!#barrel 
