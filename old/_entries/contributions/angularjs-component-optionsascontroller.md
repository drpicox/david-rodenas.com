---
title: "AngularJS use component options as Controller"
tags:
  - contributions
  - angularjs
  - styleguide
  - compile
  - javascript
  - component
date: 2016-09-09
source: https://github.com/angular/angular.js/pull/15112
description: >
    This contribution allows to use options 
    directive definition object as
    controller.
    The current status is rejected.
snippet: |
    ```javascript
    export class MyComponent {
        static get templateUrl() { return 'myTemplate.html' }
        constructor() { this.editMode = false; }
        toggleEditMode() { this.editMode = !this.editMode; }
    }
    ```
---

The idea of this PR was to remove the necessity of the 
directive definition objects (usually a stopper for new programmers)
and instead use static fields in controllers.

Although it is already possible with a small workaround,
this small PR makes it easier and cleaner.

A component previous to this PR will look as:

```javascript
export const MyComponent = {
    templateUrl: 'myTemplate.html',
    controller: class MyController {
        constructor() {
            this.editMode = false;
        }
        toggleEditMode() {
            this.editMode = !this.editMode;
        }
    }
}
```

after this PR it becomes: 

```javascript
export class MyComponent {
    static get templateUrl() { 
        return 'myTemplate.html'
    }
    constructor() {
        this.editMode = false;
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
    }
}
```

a current working workaround is:

```javascript
export class MyComponent {
    static get controller() { 
        return MyComponent;
    }
    static get templateUrl() { 
        return 'myTemplate.html'
    }
    constructor() {
        this.editMode = false;
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
    }
}
```

This PR was rejected because it:
- generates a new way to do the same (more complexity),
- the initial solution, although the indentation, was good enough

As consequence I updated the guide 
[howto create a angularjs component in typescript](../angularjs-components-typescript)
and [es2015](../angularjs-components-es2015)
to reflex it.
