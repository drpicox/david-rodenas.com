---
tilte: "Understanding this"
tags: 
  - teaching
  - javascript
  - this

snippet: | 
  ```javascript
  alice.sayHello(bob)
  ```

description: >
  In javascript this is evil. 
  Until ES2015 it never works at it expects.
  Here I explain few cases and how to understand better this.

---

## What is this?

This is an _implicit_ parameter of a function call.
Implicit means that it is invisible, someone else writes it for us.

When you execute:

```javascript
alice.sayHello(bob)
```

it internally executes:

```javascript
alice.sayHello.call(alice, bob)
```

## There are no methods

Javascript only has functions, 
and unlike other programming languages, 
functions are not binded to any object.

So when we see this code:

```javascript
alice.sayHello(bob)
```

Here `sayHello` can live without the alice object.
This is perfectly legal:

```javascript
var sayHello = alice.sayHello;
sayHello(bob);
```

This is because `sayHello` is just a function, nothing else.

## Giving value to this

Any function can use this:

```javascript
function sayHello(other) {
  console.log(this.name + ' say hello to ' + other.name);
}
```

What will happen if we do:

```javascript
sayHello(bob);
```

### ES3 

If we are using ES3, the result is likely to be: ` say hello to bob`.

This happens because this becomes `window`. So:

```javascript
function isThisWindow() {
  console.log(this === window);
}
isThisWindow();
```

Shows `true` in the console.

### ES5

Here we have two modes: strict mode, and compatibility mode.

Compatibility mode behaves exactly like ES3.

Strict mode set this to undefined:

```javascript
'use strict';
function isThisUndefined() {
  console.log(this === undefined);
}
isThisUndefined();
```

Shows `true` in the console.


