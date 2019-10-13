---
title: AngularJS Tags
description: > 
  A new simplified way to write
  AngularJS code in a Polymer like
  fashion 100% with angular.
website: https://github.com/drpicox/ngtags
tags:
  - projects
  - angular
  - angularjs
  - javascript
  - npm
  - bower
  - grunt
  - tools
  - polymer
snippet: |
  ```html
  <angular-element name="hello-world">
    <template>
        Hello World!
    </template>
  </angular-element>
  ```
---

Motivation
----------

The origin of this project was in the observation of the following situations:

- while working in many AngularJS 1 teams I have realized that AngularJS programmers does not likes to create directives, they usually avoid them, mainly because they do not understand the abstraction underlying neither the syntax

- after doing some jobs in Polymer (v0.5 and earlier), and talking with other developer, I have realized that polymer developers loved to create new components


Because AngularJS directives and Polymer components are very alike, I decided to build a tool to allow to create AngularJS directives in the same fashion that Polymer does.


How to use it
-------------

I have developed [grunt-ngtags](https://www.npmjs.com/package/grunt-ngtags)
which allowed to transform ng-tags components into AngularJS directives.

Many examples and possibilities of this library can be found [here](https://github.com/drpicox/ngtags/tree/master/examples)
This examples includes features like:

- create attribute directives (like Angular2 directives)
- create element directives (like Angular2 components)
- lifecycle activation hook (like Angular2)
- dependency injection
- routes components (like Angular2)
- inline styling (like Angular2)
- parent references (AngularJS require)
- children references (like Angular2)
- component bindings
- host classes (like Angular2)
- multi-transclussion (like Angular2 and now AngularJS > 1.5)



Other considerations
--------------------

I developed this tool nearly parallel to first implementations of Angular 2,
even before many things about it become stable or public.

It surprised me a lot that some of the simplifications of AngularJS 1 done in
this project also appears in Angular 2. 
I want to think that it is because they are good idea, and we both 
got to the same conclusions.
