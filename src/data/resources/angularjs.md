---
icon: shield
logo: images/resources/angularjs.png
title: AngularJS
abstract: >
  AngularJS is a
  modular 
  MV* Javascript
  framework.
tags:
  - apps  
---
[AngularJS](http://angularjs.org/)
is one of the most amazing 
frameworks to develop web applications.
It ties HTML code to Javascript data structures.
The best of it is that it works
like magic (of course, no magic involved, only
lots of comparissons).

### Works like a game engine

AngularJS works like a game engine:
it has a engine loop that updates and draws
everithing.

Data to be displayed in HTML is kept in a special
environment variables called
[$scope](http://docs.angularjs.org/api/ng.$rootScope.Scope).
This data are values which can be manipulated
easily and directly as plain Javascript objects.
Time to time, the main loop is triggered
and HTML will be updated.
This loop is known as the
[$digest](http://docs.angularjs.org/api/ng.$rootScope.Scope#$digest)
loop. 
What it does is to check every value inside
the `$scope` against a copy of the previous loop.
If all values are the same it stops and updates
HTML values. If some values have been changed,
the loop computes all derived values and the loop 
is triggered again. This step is repeated until
nothing changes, or a maximum loops have been
reached.

I really suggest to read the 
[source code](https://ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.js)
to learn about it works.

### Lots of libraries

AngularJS have lots of external modules. Some of them are:

- [Google Analytics in AngularJS](http://stackoverflow.com/questions/10713708/tracking-google-analytics-page-views-with-angular-js)

Bootstrap + AngularJS:

- [Angular Strap](http://mgcrea.github.io/angular-strap/)
- [Bootstrap UI](http://angular-ui.github.io/bootstrap/)
- [UI Utils](https://github.com/angular-ui/ui-utils)
- [UI Router](https://github.com/angular-ui/ui-router)
  
### Other

How to control route changes and avoid false redraws: [here](http://www.youtube.com/watch?v=P6KITGRQujQ).
