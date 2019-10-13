---
title: "Writing Angular1 components in Typescript (class form)"
tags:
  - teaching
  - angular
  - typescript
  - es2015
  - component
  - styleguide
  - howto
date: 2016-09-08
description: >
    Shows how to write Angular1 components
    using the new .component syntax of Angular 1.5,
    and typescript just using classes.
    It leverages in ES2015 classes and modules, 
    Typescript typing
    and Angular2 styleguide.
snippet: |
    ```typescript
    export class HelloWorldComponent {
      static template = `Hello {{ "{{$ctrl.name"}}}}`;
      static controller = HelloWorldComponent;
      constructor() {
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
the same techniques works across all code,
and no surprises for new programmers.

This guide leverages in ES2015 classes and static properties
to allow define components using just one class.


Implementation overview
-----------------------

```typescript
// counter.component.ts
export class CounterComponent {
  static controller = CounterComponent;

  static bindings = {
    initialCount: '<',
  };
  
  static template = `
    <p>
      <button ng-click="$ctrl.increment()">+</button>
      <button ng-click="$ctrl.decrement()">-</button>
      Count: {{ "{{$ctrl.count"}}}}
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

```typescript
// app.module.ts
import { CounterComponent } from './counter.component';

export const AppModule = angular
  .module('AppModule', [])
  .component('myCounter', CounterComponent)
  .name;
```


Step by step explanation
------------------------

### Component declaration and registration

Create the component as a class and register it.

```typescript
// counter.component.ts
export class CounterComponent {
  // ...
}
```

Import the component in the module and register it.

```typescript
// app.module.ts
import { CounterComponent } from './counter.component';

export const AppModule = angular
  .module('AppModule', [])
  .component('myCounter', CounterComponent)
  .name;
```


### Component definition

Define component 
[configuration](https://docs.angularjs.org/guide/component#comparison-between-directive-definition-and-component-definition)
as _static_ properties of the class.

```typescript
export class CounterComponent {
  static bindings = { /* ... */ };
  static template = `...`;
  // ...
}
```

Now you have to tell that your class is in fact the controller:

```typescript
export class CounterComponent {
  static controller = CounterComponent;
  // ...
}
```


### Component controller properties

Add as instance properties bindings and other controller state properties. 

```typescript
  initialCount: number;  
  salute: string;
```


### Component controller constructor

The constructor for the component.
Usually it defines injections, add `/* @ngInject */ comment 
so _ngannotate_ can do its work. 

```typescript
  /* @ngInject */
  constructor() {
  }
```


### Component controller methods

Define all your component logic as methods.

```typescript
  increment() {
    this.count++;
  }
  
  decrement() {
    this.count--;
  }
```


### Component hooks

Declare you component hooks as methods of the class.

```typescript
  $onInit() {
    this.count = this.initialCount;
  }
```

More information about lifecycle hooks [here](https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks).




How to make injections
----------------------

You can leverage in Typescript to have injections with type checking and auto-completion support.

```typescript
// ./hello-world.component
import { SaluteService } from './salute.service';

export class HelloWorldComponent {
  static controller = HelloWorldComponent;
  static bindings = {
    name: '<',
  };
  static template = `
    <h1>{{ "{{$ctrl.salute"}}}}</h1>
  `;
  
  name: string;
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

```typescript
import { SaluteService } from './salute.service';
import { HelloWorldComponent } from './hello-world.component';

export const AppModule = angular
  .module('AppModule', [])
  .service('saluteService', SaluteService)
  .component('myHelloWorld', HelloWorldComponent)
  .name;
```


ES2015
------

Everything is supported in ES2015 but types and 
[class properties](http://kangax.github.io/compat-table/esnext/#test-class_properties).
Static class properties can be replaced by getters, 
instance properties are created with the constructor
and types are removed.

This is the same code with ES2015:

```javascript
// counter.component.js
export class HelloWorldComponent {
  static get controller() { 
    return HelloWorldComponent; 
  }
  static get bindings() {
    return {
      name: '<',
    };
  };
  static get template() { 
    return `
      <h1>{{ "{{$ctrl.salute"}}}}</h1>
    `;
  }

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
// app.module.js
import { CounterComponent } from './counter.component';

export const AppModule = angular
  .module('AppModule', [])
  .component('myCounter', CounterComponent)
  .name;
```




More information
----------------

- See here for a live demo: http://plnkr.co/edit/R8qBzz?p=preview
- See https://github.com/drpicox/david-rodenas.com/tree/v5.4.2 for a real example
