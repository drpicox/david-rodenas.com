---
title: "drpx-transcludeto"
tags:
  - angularjs-extensions
  - view
  - projects
  - angularjs
  - component
  - npm
  - bower
  - contributions
date: 2015-03-08
source: https://github.com/drpicox/drpx-transcludeto
description: >
    Library to define AngularJS directives 
    that with multiple transclusion since AngularJS 1.2.
    It allows to parametrize directives
    with multiple templates.

snippet: |
    ```html
    <my-custom-list>
        <h1 target-to="header">People</h1>
        <div target-to="item">
            {{$parent.item}}
        </div>
        <div target-to="footer">
            <button ng-click="add()">Add</button>
        </div>
    </my-custom-list>
    ```
---

## Overview 

Before Angular 1.5. it was not support to 
create directives that can receive multiple
templates.

This library allows to create those directives.
It works on top of AngularJS and allows to define
these new input parameters. 

It allows to create highly reusable presentation 
components.

**Note**: Although Angular 1.5 supports multi-transclusion, 
Angular 1.2 (supports IE8) does not. 
You can use this library in Angular 1.2.


## Example

```html
<my-custom-list>
    <h1 target-to="header">People</h1>
    <div target-to="item">
        {% raw %}{{$parent.item}}{% endraw %}
    </div>
    <div target-to="footer">
        <button ng-click="add()">Add</button>
    </div>
</my-custom-list>
```

```html
<!-- my-custom-list.html -->
<div class="header" transclude-id="header">Default Header</div>
<ul>
    <li ng-repeat="item in list" transclude-id="item"></li>
</ul>
<div class="footer" transclude-id="footer"><hr></div>
```

```javascript
app.directive('myCustomList', 
  ['transcludeToPreLink', function
  ( transcludeToPreLink ) {
    return {
        restrict: 'E',
        templateUrl: 'myCustomList.html',
        transclude: true,                      // needs transclusion activate
        scope: {},                             // needs own scope
        link: {pre: transcludeToPreLink(), post: link},
    };

    function link(scope) {
        scope.list = ['first','second','third'];
    }
}]);
```

## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-transcludeto
```

Include the javascript library in your application.

```html
<script src="bower_components/drpx-transcludeto/drpx-transcludeto.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxTranscludeTo' ]);
```

See Github for more information.
