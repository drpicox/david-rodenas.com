---
title: "Rollup vs Webpack2 and constant optimizations"
tags:
  - npm
  - build
  - bundle
  - es2015
  - rollup
  - webpack
  - tree-shaking
  - scope-hoisting
  - constant-propagation
  - compilers
date: 2016-10-12
description: >
    There are substantial differences in the strategy of
    tree-shaking and bundle generation between rollup and webpack 2.
    Here I analyse how it affects to constant propagation
    and constant optimizations, compare both, and 
    show results.
snippet: |
    ```javascript
    // pager.js
    export const pageCount = 4*5;
    // index.js
    import pageCount from './pager'
    if (pageCount > 100) {
      doComplexStuff();
    }  
    ```
---


Main difference between rollup and webpack 2 is
**scope hoisting**.
Rollup moves all imported/exported symbols to
the same level, renaming when conflicts arise,
and removing all import/export overhead.

But it have more implications: removing all import/overhead
also creates more simple bundles. 
Simple bundles are easier to analyse by compilers
and it enables more advanced optimizations.

In this post I will consider only constants 
and constant propagation and constant folding.


### Optimizations for constants

**Constant folding**: 
when the compiler finds a constant operation, 
it executes operation and outputs only the results.

```javascript
// before
var x = 3 + 5;

// after
var x = 8;
```

**Constant propagation**: 
if there is a variable that takes a constant as a value,
the compiler replaces the variable by the constant.

```javascript
// before
var x = 8;
var y = x + 4;

// after
var x = 8;
var y = 8 + 4;

// here it can apply now constant folding
var x = 8;
var y = 12;
```

**Expression simplification**:
use algebra to simplify complex operations expressions.

```javascript
// before
a[3] = 1 + i + 1;

// after
a[3] = i + 2;
```


### Optimizations enabled

**Dead code elimination**:
detects code that have no effect in the program and removes it.

Basic example:

```javascript
// before
if (false) {
  console.log('remove me please');
} else {
  console.log('show me please');
}

// after
console.log('show me please');
```

Removes unused variables:

```javascript
// before
var x = get('secret');
var y = get('public');

if (false) {
  console.log(x);
} else {
  console.log(y);
}

// after
var y = get('public');
console.log(y);
```

Removes unused functions:

```javascript
// before
function show() {
  console.log('show me');
}
function hide() {
  console.log('hide me');
}

if (false) {
  hide();
} else {
  show();
}

// after
function show() {
  console.log('show me');
}

show();
```

All combined with constant optimizations:

```javascript
// before
var x = 8;
var y = x + 2;

function largeY() {
  console.log('there is a very large y');
}
function smallY() {
  console.log('y is small');
}

if (y > 20) {
  largeY();
} else {
  smallY();
}
console.log('y:', y);

// after
function smallY() {
  console.log('y is small');
}

smallY();
console.log('y:', 10);
```


### Example for rollup and Webpack

Given the following example:

```javascript
// entry.js
import { 
  currentPage, 
  getDocumentSize, 
  nextPage, 
  pageCount
} from './barrel';

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

We have compiled them through both,
rollup and webpack 2 and optimized them.

Rollup minimized result is:

```javascript
function o() { n++ }
var n = 0;
console.log("before:", n), o(), console.log("after:", n)
```

Webpack 2 minimized result is:

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

### Comparison

The comparison of bundle sizes is the following:

| Tool     | minimized | gzipped   |
| -------- | --------: | --------: |
| RollupJS | 108 bytes |  94 bytes |
| Webpack  | 958 bytes | 454 bytes |
| Webpack (without loader) | 490 bytes | 238 bytes |

Webpack 2 bundle size is more than twice as large as the rollup bundle. 
It is unable to minimize the code because a computed property 
inside an object returns the constant. 
Webpack 2 creates his computed property by itself, it did not exist before. 
Because of it, tree-shaking is not complete in webpack 2: it is not removing all unused functions. 

Here webpack2 dead code elimination cannot remove `getDocumentSize` function.


### Conclusion

Rollup scope-hoisting strategy is great: 
it enables all kind of advanced compiler stategies.

In the other hand Webpack 2 obscures the result
and does not let the compiler to do its job.


### More information

See:
- Code example with constants: https://github.com/drpicox/rollup-vs-webpack/tree/with-constants
- Wikipedia constant folding: https://en.wikipedia.org/wiki/Constant_folding
- Compiler optimizations guide: http://www.compileroptimizations.com/index.html 
