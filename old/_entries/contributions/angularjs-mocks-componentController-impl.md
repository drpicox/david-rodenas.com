---
title: "AngularJS $componentController implementation"
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
date: 2016-04-10
source: https://github.com/angular/angular.js/pull/13732
description: >
    The implementation of $componentController 
    so it does not need to increase the size of angular.min.js library,
    but it allows to create tests of components.
snippet: |
    ```javascript
    it('should instantiate a controller of a component', inject(function($componentController) {
        var myController = $componentController('myComponent');
        expect(myController).toBeDefined();
    }));
    ```
---

The final merge is [here](https://github.com/angular/angular.js/commit/72b96ef57a28743e2dfed523701cc2e88e3b473b).

When I made this 
[$componentController proposal](../angularjs-mocks-componentController-proposal)
my idea was to implement it without increasing the size of angular.min.js.
@petebacondarwin was faster, in almost no time he liked the idea and implemented it.
But, he also modified compile.js which resulted in a increase size of angular.min.js.

I get his code as reference, and I did a new implementation of `$componentController`,
this time accessing just AngularJS metadata and removing all changes inside compile.js.

The result this PR and the current recommended way to test components supported
by the official [AngularJS guide](https://docs.angularjs.org/guide/component#unit-testing-component-controllers).


