---
title: Using multiple bundles with browserify
tags:
  - teaching
  - javascript
  - browserify
  - bundle
  - npm
  - performance
description: >
  Browserify is able to generate multiple bundles using 
  its options or plugins.
snippet: |
  ```bash
  $ browserify x.js y.js \
     -p [ factor-bundle -o bundle/x.js -o bundle/y.js ] \
     -o bundle/common.js
  ```
---

## Split using no plugin

It requires to have a common
javascript entry point. 
This common entry point is 
extracted into a common.js file.

For example:

```javascript
// robot.js
module.exports = function (s) { return s.toUpperCase() + '!' };
```

```javascript
// beep.js
var robot = require('./robot.js');
console.log(robot('beep'));
```

```javascript
// boop.js
var robot = require('./robot.js');
console.log(robot('boop'));
```

We can split the bundle into three bundles as follows:

```bash
$ browserify -r ./robot.js > static/common.js
$ browserify -x ./robot.js beep.js > static/beep.js
$ browserify -x ./robot.js boop.js > static/boop.js
```

Each landing can include only its script files:

```html
<!-- beep.html -->
<script src="common.js"></script>
<script src="beep.js"></script>
```

```html
<!-- beep.html -->
<script src="common.js"></script>
<script src="boop.js"></script>
```


## Split using factor-bundle

It automatically detects common files 
and creates a bundle with these common bundles.

See: [https://www.npmjs.com/package/factor-bundle](https://www.npmjs.com/package/factor-bundle)

Install the plugin:

```bash
$ npm install factor-bundle -D 
```

Given the previous example,
invoke the browserify with the plugin as follows:

```bash
$ browserify beep.js boop.js \
    -p [ factor-bundle -o static/beep.js -o static/boop.js ]
    -o static/common.js
```

Each landing will have the same code.

You can observe that in this solution it does not need to know
that robot.js is common to both files, so it makes 
maintenance easier.
