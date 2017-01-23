---
title: Babelify browserify Transform
source: https://github.com/babel/babelify
tags:
  - browserify-transforms
  - browserify
  - teaching
  - babeljs
  - es2015
  - javascript
  - bundle
  - npm
description: >
  It translates ES2015 sources
  into ES3 so any browser can read them.

snippet: |
  ```          
  $ npm i -D babelify babel-preset-es2015
  transforms.push(['babelify', {sourceMap: true, presets: ['es2015']}])
  [1,2,3].filter(x => x > 2);
  ```  
---

## Overview

It transforms:

```javascript
[1,2,3].map(n => n + 1);
```

into:

```javascript
"use strict";

[1, 2, 3].map(function (n) {
  return n + 1;
});
```

So it can be minimized safely.


## Other considerations

Babel is a very large project with many presents and plugins.
Please, verify that you are using the right preset for you.
