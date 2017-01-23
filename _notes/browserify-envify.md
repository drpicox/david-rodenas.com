---
title: Envify browserify transform
source: https://github.com/hughsk/envify
tags:
  - browserify-transforms
  - browserify
  - teaching
  - shell
  - javascript
  - bundle
  - npm
  - performance
description: >
  It captures shell environment variables 
  values in the compile time and uses it
  to generate the bundle.

snippet: |
  ```          
  $ npm i -D envify
  transforms.push('envify')
  if (process.env.DEBUG) { ... }
  ```  
---

## Overview

It transforms:

```javascript
if (process.env.DEBUG) {
    console.log('This step');
}
```

into:

```javascript
if ("") {
    console.log('This step');
}
```

if the DEBUG shell environment value was empty or not defined,
or: 

```javascript
if ("YES") {
    console.log('This step');
}
```

if it was set to `YES`.

Note that a minimizer will remove all code of the first case.


## Other considerations

It is very useful to softcode endpoints and
other production deployment features.
It is also very effective in cordova applications.
