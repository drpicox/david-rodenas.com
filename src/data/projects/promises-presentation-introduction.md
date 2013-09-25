---
title: "Promises Presentation: Introduction"
image: images/resources/promises.png
abstract: >
  Promises is a Javascript technique that un-inverts
  chain of responsability and eases and improves
  callback handling.
url: "http://drpicox.github.io/promises-presentation-introduction/#/index"
source: "https://github.com/drpicox/promises-presentation-introduction"
tags:
  - javascript
  - promises
  - impressjs
  - event
  - presentation
  - apps
  
---
The big issue of Javascript programming is the callback handling.
Callback handling is very complex and it is difficult to mantain
and even found qualified professionals. 

Main callback problems come that they invert the chain of responsability,
it changes the way that code is written, it makes more difficult 
the error handling, and it even requires to explicit the 
concurrency dependences.

Promises introduces a new kind of object that eventually will have
a value. This object, promise, can be used as any other variable
but it requires to use `then` to eventually query its value.

This presentation was part of the speech that I gave
the 10th of September in the [BarcelonaJS](http://barcelonajs.org) group. 
There were around of 70 people attending to the event.

