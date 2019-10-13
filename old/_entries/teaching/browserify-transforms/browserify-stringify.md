---
title: "Stringify browserify transform"
source: https://github.com/JohnPostlethwait/stringify
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
  It allow to require files
  as plain strings and optionally
  minimizes them.

snippet: |
  ```          
  $ npm i -D stringify
  transforms.push(['stringify', {'extensions': [ '.html' ], "minify": true}])
  var tpl = require('./my.tpl.html');
  ```  
---

## Overview

When it encounters an expression like:

```javascript
var tpl = require('./my.tpl.html');
```

and a template like:

```html
<h1>My template</h1>
Does {% raw %}{{ cool }}{% endraw %} stuff.
```

it transform the _html_ file into a javascript entry point like:

```javascript
module.exports = {% raw %}"<h1>My template</h1>\nDoes {{ cool }} stuff."{% endraw %};
```



## Other considerations

Be careful with html minification. 
Make sure that the same values are applied to development and production configuration.
Some spaces may modify the page layout.

Minification options are specified [here](https://github.com/kangax/html-minifier).
