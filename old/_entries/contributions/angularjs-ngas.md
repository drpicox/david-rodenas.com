---
title: "AngularJS ngAs"
tags:
  - contributions
  - angularjs
  - angular
  - polymer
  - riotjs
  - feature
  - ngclass
  - javascript
date: 2016-02-18
source: https://github.com/angular/angular.js/pull/14405
description: >
    This contribution allows to 
    bind child components controllers
    to current template scope.
    It behaves similar to Angular2 let,
    or Polymer and RiotJS id.
snippet: |
    ```html
    <toggle ng-as="burger"></toggle>
    <menu ng-if="burger.isVisible"></menu>
    ...
    <countdown-timer ng-as="$ctrl.countdownTimer"></countdown-timer>
    <button ng-click="$ctrl.relaunch()"></button>
    ```
---

I have used [drpxId directive](../angularjs-drpx-id)
years before my PR 
in many of my implementations, 
many times, and resolved many problems,
making solutions cleaner and easier to understand.

Angular 2 also introduced the same concept.

Thus, I decided to contribute this code inside
the Angular core so it was available to anyone.

In the moment of writing this lines it is still in 
process of beign accepted, programmed to be merged in 1.5.x.
