---
title: "Improved performance in Angular 1.5.8"
tags:
  - angularjs
  - performance
  - contributions
date: 2016-08-25
description: >
    Angular 1.5.8 improves the performance around
    a 5~10%.
    You can achieve better performance in the application
    boostrap and in directive compilation just upgrading.
snippet: |
    ```javascript
    "dependencies": {
      "angular": "^1.5.8"
    }
    ```
---

While I was working with angular and analysing the time for an application to start
I have found the following message from the browser hundreds of times:

![performance warning](assets/images/angular-1_5_7-performance-warning.png)


What this message mean?
-----------------------

This message is the browser telling to us
that there is a function that he thinks that have to be optimized
but it cannot optimize it.

In this case, the browser founds a _try/catch_ statement 
inside a function and it prevents optimizations. 


Does it really affects so much?
-------------------------------

If this message is triggered possibly yes.
It is only shown when the browser thinks that a function should be optimized.

An unoptimized function means that it cannot be compiled in assemble,
the fastest language possible. That means that such function will be between 10 and 1000
times slower.

In the case of angular, in one of my applications the profiling shows the following:

![boostrap time](assets/images/angular-1_5_7-boostrap-time.png)

It says that the cost of execution the function is near the 
8.5% of the cost of whole application.

In this case, allowing the browser to optimize this function, 
it would mean that it will cost from 8.5% to less than 1%, which is near
to a 8% of performance improvement.  


How did you enabled the optimization?
-------------------------------------

`collectDirectives` is a large function, 
that did a large number of stuff, 
and only in one case it requires to execute a try/catch 
(mainly because a weird error in IE9).

The function looked like this:

```javascript
function collectDirectives(...) {
  ...lot of stuff...
  switch (kindOfElement) {
    ...lots of cases...
    case Comment:
      try {
        ...collect comment stuff...
      } catch (e) {
        handleException(e);
      }
  }
}
```

If we look to this function you can see that it does lot of stuff
but the _try/catch_ only has to be executed when there is a comment element,
which in production is never likely to happen.
Because this _try/catch_ appears, browser cannot optimize the whole function.

The solution that I applied to this case is 
to extract comment element collection outside of the function
inside a new function:

```javascript
function collectDirectives(...) {
  ...lot of stuff...
  switch (kindOfElement) {
    ...lots of cases...
    case Comment:
      collectDirectivesInComments(...);
  }
}
function collectDirectivesInComments(...) {
    try {
      ...collect comment stuff...
    } catch (e) {
      handleException(e);
    }
}
```

This refactor removes the _try/catch_ statement from the main function
and only when a comment is found the try/catch and unoptimized function is executed. 


Is _try/catch_ bad for performance?
-----------------------------------

There is nothing wrong with _try/catch_, 
but you should use it wisely and carefully. 

As a general rule, 
you can use it inside a functions used scarcely (for example, each time that the user clicks),
but you should avoid it in large loops that require real time behaviour.

An example of how to deal with _try/catch_:

```javascript
/* avoid */
requestAnimationFrame(function() {
  var elapsed = getElapsed();
  var i, l = elements.length;
  for (i = 0; i < l; i++) {
    try {
      element[i].frame(elapsed);
    } catch (e) { handleException(e); }
  }
});
```

An equivalent implementation would be:

```javascript
/* recommended */
requestAnimationFrame(function() {
  var elapsed = getElapsed();
  var i, l = elements.length;
  for (i = 0; i < l; i++) {
    try {
      callFrames();
    } catch (e) { handleException(e); }
  }
  function callFrames() {
    for (; i < l; i++) {
      element[i].frame(elapsed);
    }
  }
});
```

In this second implementation the main loop is executed by 
callFrames, that has no _try/catch_ expression and it can be optimized. 
The parent function it only executes once, 
so probably no optimization is required. 


Learn more
----------

You can see the exact details of this performance optimization in
[my contribution](https://github.com/angular/angular.js/pull/14848). 
