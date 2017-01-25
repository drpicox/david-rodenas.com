---
title: "AngularJS $componentController proposal"
tags:
  - contributions
  - angularjs
  - performance
  - mocks
  - components
  - componentController
  - controller
  - testing
  - javascript
date: 2016-01-06
source: https://github.com/angular/angular.js/issues/13683#issuecomment-169417606
description: >
    A proposal to simplify the testing of component controllers
    without incrementing the footprint size of angular.min.js,
    without requiring to compile the whole component,
    and easily exposing the controller to the test.
snippet: |
    ```javascript
    /* we may test with something like: */
    var fooControllerInstance = $componentController('myFoo', locals, { myBindings... });
    ```
---

That was sound.

I have been reading the thread of new component proposal for AngularJS 1
in order to make things closer to Angular 2, 
and then I have discovered the idea of exposing all components controllers
so anyone can instantiate them with `$controller` or with `ngController`.

I was terrified with the idea. 
I do support to many development teams in Angular, 
I have seen how many coders solve problems,
and I automatically imagined how they would start using `$controller` 
and `ngController` with component controllers in production code 
and all fail scenarios. I was really terrified.

So I proposed an alternative: `$componentController`.
It should be exactly like `$controller`, even better, 
because it could
help to build all the component environment, and with some extra good 
points:

- it should not pollute the controllers space, no new controllers appears when you define components
- it will not allow use component controllers in ngController directives without the component
- it will not allow use component controllers in any other _creative_ solutions in production code
- and it will not increase any extra byte in the angular.min.js

