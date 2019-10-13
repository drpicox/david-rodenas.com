---
image: /assets/images/observables.svg
image_width: 504
image_height: 504
tags:
  - observe
  - patterns
  - reactivejs
  - rxjs
  - javascript
  - teaching
  - root
---
Observables are a powerful tool, but there is a lot of confusing and only few recepies.
Here I will present some of the basics and few recipes.

* replace by toc
{:toc}

## Overview

Observables are based in Haskell (first seen in Miranda) [lazy lists evaluation](https://wiki.haskell.org/Lazy_evaluation){:target="_blank"}: the capacity of process infinite lists under demmand.

The reason of this is to avoid dealing with side effects. For example, the following code:

```javascript
function myApp() {
  let number;
  while (number = prompt()) {
    let result = number * 2;
    alert(result);
  }
}
```

Functions `prompt` and `alert` have side effects: 
- `prompt` may give a different result each time that it is executed
- `alert` does not even have an obvious result
In this case, not even myApp has a clear output.

The equivalent functional would be something like:

```javascript
function myApp(numbers) {
  return numbers.map(number => number * 2);
}
```

But where inputs comes from and which are the results?
A possible explanation should be something like:

```javascript
let numbers = [], number;
while (number = prompt()) {
  numbers.push(number);
}
let results = myApp(numbers);
results.forEach(result => alert(result));
```

But it does not behaves by the same way:
it first reads all the numbers, does the computation, and shows all the results.
What if we want to see results as we write numbers? 
What if we need to use the app for days and we cannot wait until the last day.

Here is where lazy evaluation and Observables can help us.

```javascript
let numbers = new Observable(observer => {
    let number;
    while (number = prompt()) {
      observer.next(number);
    }
    observer.complete();
});
let results = myApp(numbers);
results.subscribe(result => alert(result));
```

Now we have the exact same behaviour that the initial version: results are produced as numbers are introduced in the app.
This is because the `map` method of the observable is lazy: it only executes when there are inputs available and results are required.

## Recipes

### Generator

Generates a list of values each time that an even happens.

```javascript
function observeElementEvents(element, eventName) {
  return new Observable(observer => {
    // Create an event handler which sends data to the sink
    let handler = event => observer.next(event);

    // Attach the event handler
    element.addEventListener(eventName, handler, true);

    // Return a cleanup function which will cancel the event stream
    return () => {
      // Detach the event handler from the element
      element.removeEventListener(eventName, handler, true);
    };  
  });
}
```

### Observable State

Generates a flow of values representing the changes of the state inside one service.

```javascript
class MyService {
  constructor() {
    this.state = new BehaviorSubject('initial state');
  }
  getState$() {
    return this.state;
  }
  setState(value) {
    this.state.next(value);
  }
}
```

### Observable Reducer State

Like Observable state, but it uses a reducer to update the value.
It helps to make sure that the value is always consistent.

```javascript
class MyService {
  constructor() {
    this.state = new BehaviorSubject(0)
        .scan((r, fn) => fn(r));
  }
  getState$() {
    return this.state;
  }
  decrement() {
    this.state.next((n) => n - 1);
  }
  increment() {
    this.state.next((n) => n + 1);
  }
}
```

