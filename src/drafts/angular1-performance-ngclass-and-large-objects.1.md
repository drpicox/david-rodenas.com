---
title: "Angular1 Performance: ngClass refactorized and optimzed"
tags:
  - angular1
  - performance
  - contribution
  - benchpress
  - ngClass
  - $watch
date: 2016-11-29
abstract: >
    In earlier articles I have presented how to use ngClass
    to solve some performance bottlenecks. 
    Since Angular 1.5.9 it is not longer necessary,
    now Angular automatically makes performance optimizations for you. 
snippet: |
    ```html
    <i class="icon" ng-class="{friendly: user.friends, male: user.isMale}">...</i>
    <td ng-class="{completed: todo.completed}">...</td>
    ```
---


Previous optimizations
----------------------

In earlier posts I have presented that you might optimize this:

```html
<td ng-class="{completed: todo.completed}">...</td>
<!-- into: -->
<td ng-class="todo.completed && 'completed'">...</td>
```

and you must optimize this:

```html
<i class="icon" ng-class="{friendly: user.friends, male: user.isMale}">...</i>
<!-- into: -->
<i class="icon" ng-class="{friendly: !!user.friends, male: user.isMale}">...</i>
```


No optimizations longer necessary
---------------------------------

Such optimizations are not longer necessary.
Some time ago I proposed the following PR:

- https://github.com/angular/angular.js/pull/14404


It was accepted, but because it involved a major refactor
of ngClass, it was implemented step by step by the core team itself.
   



More information
----------------

You can consult the official documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.

- $compile: https://docs.angularjs.org/api/ng/service/$compile
- $watch: https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
