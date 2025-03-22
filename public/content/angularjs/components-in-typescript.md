---
title: "AngularJS components in TypeScript"
user: "drpicox"
tags:
  - teaching
  - angularjs
  - typescript
  - ddo
  - component
  - styleguide
  - howto
---

# AngularJS components in TypeScript

Shows how to write Angular1 components
using the .component syntax of AngularJS,
and TypeScript using classes and DDO.

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

## Overview

```typescript
// counter.component.ts
export const CounterComponent = {
  bindings: {
    initialCount: '<',
  };
  template: `
    <p>
      <button ng-click="$ctrl.increment()">+</button>
      <button ng-click="$ctrl.decrement()">-</button>
      Count: {{ $ctrl.count }}
    </p>
  `;
  controller: class CounterController {
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

## Step by step

### Component declaration and registration

Create the component as a constant _DDO_ object and register it.

```typescript
// counter.component.ts
export const CounterComponent = {
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
as properties of the _DDO_ object.

```typescript
export class CounterComponent {
  bindings: { /* ... */ },
  template: `...`,
  // ...
}
```

If you need a controller, define it inside the _DDO_:

```typescript
export class CounterComponent {
  // ...
  controller: class CounterController {
    // ...
  }
}
```

### Component controller properties

Add as instance properties bindings and other controller state properties. 

```typescript
  controller: class CounterController {
    initialCount: number;  
    salute: string;
    // ...
  }
```

### Component controller constructor

The constructor for the component.
Usually it defines injections, add `/* @ngInject */` comment 
so _ngannotate_ can do its work. 

```typescript
  controller: class CounterController {
    // ...
    /* @ngInject */
    constructor() {
    }
  }
```

### Component controller methods

Define all your component logic as methods.

```typescript
  controller: class CounterController {
    // ...
    increment() {
      this.count++;
    }
    
    decrement() {
      this.count--;
    }
  }
```

### Component hooks

Declare you component hooks as methods of the class.

```typescript
  controller: class CounterController {
    // ...
    $onInit() {
      this.count = this.initialCount;
    }
  }
```

More information about lifecycle hooks [here](https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks).

## How to make injections

You can leverage in TypeScript to have injections with type checking 
and auto-completion support.

```typescript
// ./hello-world.component
import { SaluteService } from './salute.service';

export const HelloWorldComponent = {
  bindings: {
    name: '<',
  },
  template: `
    <h1>{{ $ctrl.salute }}</h1>
  `,
  controller: class HelloWorldController {
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

## More information

- See here for a live demo: http://plnkr.co/edit/1LXJjc?p=preview
- See https://github.com/drpicox/david-rodenas.com/tree/v5.5.0 for a real example