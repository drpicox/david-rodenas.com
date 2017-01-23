---
title: ngAnnotate browserify transform
source: https://github.com/omsmith/browserify-ngannotate
tags:
  - browserify-transforms
  - browserify
  - teaching
  - angularjs
  - javascript
  - bundle
  - npm
description: >
  It automatically adds AngularJS
  injection annotations.
  It use @ngInject comments or 
  AngularJS definitions.

snippet: |
  ```          
  $ npm i -D browserify-ngannotate
  transforms.push('browserify-ngannotate')
  /* @ngInject */ function(myService) { ... }
  ```  
---

## Overview

It transforms:

```javascript
/* @ngInject */ function myFactory(myService) { ... }
```

into:

```javascript
/* @ngInject */ function myFactory(myService) { ... }
myFactory.$inject = ['myService'];
```

So it can be minimized safely.


## Recommendations

It is recommended to use `ng-strict-di`:

- [Enable Strict DI Mode](https://docs.angularjs.org/guide/production#strict-di-mode)
