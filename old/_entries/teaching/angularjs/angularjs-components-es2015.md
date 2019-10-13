---
title: "AngularJS components in ES2015"
tags:
  - teaching
  - angularjs
  - es2015
  - ddo
  - component
  - styleguide
  - howto
date: 2016-09-09
description: >
    Shows how to write Angular1 components
    using the new .component syntax of Angular 1.5,
    and typescript using classes and DDO.
snippet: |
    ```javascript
    export const HelloWorldComponent = {
      template: `Hello {{ $ctrl.name }}`,
      controller: class HelloWorldController {
        constructor() {
          this.name = 'World';
        }
      }
    }
    ```
---

Overview
--------

```typescript
// counter.component.js
export const HelloWorldComponent = {
  bindings: {
    name: '<',
  },
  template: `
    <h1>{{ "{{$ctrl.salute"}}}}</h1>
  `,
  controller: class HelloWorldController {
    /* @ngInject */
    constructor() {
    }
    
    $onInit() {
      this.count = this.initialCount;
    }
    
    increment() {
      this.count++;
    }
    
    decrement() {
      this.count--;
    }
  }
}
```

```typescript
// app.module.js
import { CounterComponent } from './counter.component';

export const AppModule = angular
  .module('AppModule', [])
  .component('myCounter', CounterComponent)
  .name;
```
