---
title: "Writing Angular1 components in Typescript"
tags:
  - angular
  - typescript
  - es2015
  - component
  - styleguide
  - howto
date: 2016-09-08
abstract: >
    Shows how to write Angular1 components
    using the new .component syntax of Angular 1.5,
    and typescript.
    It leverages in ES2015 classes and modules, 
    Typescript typing
    and Angular2 styleguide.
snippet: |
    ```javascript
    export class HelloWorldComponent {
      static template = `Hello {{$ctrl.name}}`;
      static controller = HelloWorldComponent;
      controller() {
        this.name = 'World';
      }
    }
    ```
---

Angular 1.5 created a new interface to simplify the creation
of components called `.component`.
It uses a simple object to describe how the component will be:
which bindings there are, 
which is the template, 
which controller, 
and so on.

Angular 2 simplified concepts of Angular 1 just trying to make
everything a class by default: 
services are classes,
components are classes,
even modules are classes.
It makes apps homogeneous and isotropic:
the same techniques works in across the code,
and no surprises for new programmers.

This guide leverages in ES2015 classes and static properties
to allow define components using just one class.


Implementation overview
-----------------------

```javascript
// counter.component.ts
export class CounterComponent {
  static bindings = {
    initialCount: '<',
  };
  static controller = CounterComponent;
  
  static template = `
    <p>
      <button ng-click="$ctrl.increment()">+</button>
      <button ng-click="$ctrl.decrement()">-</button>
      Count: {{$ctrl.count}}
    </p>
  `;

  initialCount: number;  
  salute: string;
  
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
```

```javascript
// app.module.ts
import { CounterComponent } from './counter.component';

export const MyModule = angular
  .module('myApp', [])
  .component('myCounter', CounterComponent)
  .name;
```


Step by step explanation
------------------------

### Component declaration and registration

```javascript
export class CounterComponent {
```

It defines and exports the component class.

```javascript
import { CounterComponent } from './counter.component';
...
  .component('myCounter', CounterComponent)
```

It imports the component and registers it inside the Angular1 module.


### Component definition

```javascript
  static bindings = { ... };
```

All component definition properties must be declared with static.
Available properties are described 
[here](https://docs.angularjs.org/guide/component#comparison-between-directive-definition-and-component-definition).

```javascript
  static template = `
    <p>
      <button ng-click="$ctrl.increment()">+</button>
      <button ng-click="$ctrl.decrement()">-</button>
      Count: {{$ctrl.count}}
    </p>
  `;
```

You can use the new multi-line string form in ES2015 or any of the traditional forms.

```javascript
  static controller = CounterComponent;
```

The controller of the component is the current class.
We need to explain it to angular setting the `controller` property.

### Component controller fields

```javascript
  initialCount: number;  
  salute: string;
```

Add bindings and requires to class fields. 
Typescript will help you with better auto-complete and checking.

### Component controller constructor

```javascript
  /* @ngInject */
  constructor() {
  }
```

The constructor for the component.
Usually it defines injections, add `/* @ngInject */ comment 
so _ngannotate_ can do its work. 
  

### Component hooks

```javascript
  $onInit() {
    this.count = this.initialCount;
  }
```

Define the lifecycle hooks as class methods.
More information about lifecycle hooks [here](https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks).  

### Component controller methods

```javascript
  increment() {
    this.count++;
  }
  
  decrement() {
    this.count--;
  }
```

Define your component methods.


How to make injections
----------------------

You can leverage in Typescript to have injections with type checking and auto-completion support.

```javascript
// ./hello-world.component
import { SaluteService } from './salute.service';

export class HelloWorldComponent {
  static bindings = {
    name: '<',
  };
  static controller = HelloWorldComponent;
  
  static template = `
    <h1>{{$ctrl.salute}}</h1>
  `;
  
  salute: string;
  
  /* @ngInject */
  constructor(private saluteService: SaluteService) {
  }
  
  $onChanges(changes) {
    if (changes.name && changes.name.currentValue) {
      this.salute = this.saluteService.salute(this.name);
    }
  }
}
```

Import the service class at it should be done in Angular2,
and inject it in the constructor.
If you need the injection elsewhere than constructor, 
safe it in a field of the class.

Make sure that the argument name the injected
service matches exactly with the string defined in the module.

```javascript
import { SaluteService } from './salute.service';
import { HelloWorldComponent } from './hello-world.component';

export const MyAppModule = angular
  .module('myApp', [])
  .service('saluteService', SaluteService)
  .component('myHelloWorld', HelloWorldComponent)
  .name;
```

More information
----------------

- See here for a live demo: http://plnkr.co/edit/R8qBzz?p=preview
- See https://github.com/drpicox/david-rodenas.com (v5) for a real example
