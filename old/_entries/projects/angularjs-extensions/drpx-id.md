---
title: "drpx-id"
tags:
  - angularjs-extensions
  - view
  - projects
  - angularjs
  - component
  - npm
  - bower
  - contributions
date: 2015-04-13
source: https://github.com/drpicox/drpx-id
description: >
    Bind child components controller
    to the template scope.
    It behaves similar to Angular2 let,
    or Polymer and RiotJS id.
snippet: |
    ```html
    <!-- yourComponent.tpl.html -->
    <toggle id="theToggle"></toggle>
    <button ng-click="theToggle.toggle()">Toggle</button>
    <h1 ng-show="theToggle.isOpen()">My Content</h1>
    ```
---

> ### Notice
> 
> I have made a PR in AngularJS of a improved version of this directive. 
> You can find details here https://github.com/angular/angular.js/pull/14080


Example
-------

```html
    <!-- yourComponent.tpl.html -->
    <toggle id="theToggle"></toggle>
    <button ng-click="theToggle.toggle()">Toggle</button>
    <h1 ng-show="theToggle.isOpen()">My Content</h1>
```


```javascript
    /* Toggle.component.js */
    angular
        .module('Toggle', [])
        .directive('toggle', ToggleDirective);

    function ToggleDirective() {
        var directive = {
            scope: {},                   // it requires an isolated scope
            controller: ToggleController // it requires a Controller
            controllerAs: 'vm',          // it requires controller as vm
        };
        return directive;
    }

    function ToggleController() {
        var opened = false;

        this.close = function() {
            opened = false;
        };
        this.isOpen = function() {
            return opened;
        };
        this.open = function() {
            opened = true;
        };
        this.toggle = function() {
            opened = !opened;
        };
    }
```


## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-id
```

Include the javascript library in your application.

```html
<script src="bower_components/drpx-id/drpx-id.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxId' ]);
```

See Github project for more information about usage.
