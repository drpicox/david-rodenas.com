---
title: "AngularJS bind AngularJS templates"
tags:
  - angularjs-extensions
  - view
  - projects
  - angularjs
  - component
  - npm
  - bower
date: 2015-09-04
source: https://github.com/drpicox/drpx-bind-angular
description: >
    Shows how to write Angular1 components
    using the new .component syntax of Angular 1.5,
    and typescript using classes and DDO.
snippet: |
    ```html
    <span drpx-bind-angular="$ctrl.someTemplate"></span>
    ```
---

## Overview 

This is a simple AngularJS directive that
in addition to bind a template like `ngBindTemplate`
it also compiles its content.

It allows to create highly flexible and configurable views.


## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-bind-angular
```

Include the javascript library in your application.

```html
<script src="bower_components/drpx-bind-angular/drpx-bind-angular.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxBindAngular' ]);
```
