---
title: Promises
image: 
  width: 100
  height: 100
  src: /assets/images/promises.png
tags:
  - apps
  - web
  - mobile
  - server
  - javascript
description: >
  Promises are a javascript library
  designed to ease programming
  when callbacks are involved.

---
Javascript was designed as a functional programming language
(functions are objects)
and because of this it can work in environments with low resources.
When there is a potentially slow operation, Javascript 
uses the "Hollywood principle"
(don't call us, we'll call you):
instead of calling a function and block until a result is available,
Javascript expects a function as a parameter
which will be called when a value it is available (callback).
It makes Javascript programming very hard.

Promises helps to re-structure all calls and callbacks
and gives better control over exception handling.
The idea is that the function returns an special value,
which eventually will have a value (a promise).
It makes the code easier to understand and maintain.

```javascript
	Q.fcall(step1)
	.then(step2)
	.then(step3)
	.then(step4)
	.then(function (value4) {
	    // Do something with value4
	}, function (error) {
	    // Handle any error from step1 through step4
	})
	.done();
```
