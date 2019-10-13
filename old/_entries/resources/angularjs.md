---
title: AngularJS
defines: angularjs
image_width: 93
image_height: 99
image: /assets/images/angularjs.png
relevance: 3
url: http://angularjs.org/
source: https://github.com/angular/angular.js
tags:
  - apps
  - web
  - mobile
  - javascript
description: >
  AngularJS is a library to
  create apps with HTML and Javascript.

---
AngularJS, currently a Javascript library maintained by Google,
is considered pioneer in *HTML6*:
AngularJS fuses itself with the code of the web page
to extend its functionalities.

The library allows to divide effectively
the creation of the visualization
(a web page)
and the creation of the behavior
(a Javascript program).
This method allows to the designers 
to focus in the visualization
and create the best presentation for each part and component.
And at the same time programmers can write 
and test their code effectively without worry about nothing else but code.
AngularJS creates automatically a bidirectional 
bridge between both parts.

AngularJS is designed to be modular,
it is very easy to reuse parts from one project to other,
adapt visualization,
or even to test and verify the correct behavior of each
module independently
(reducing the possibility to introduce bugs).

AngularJS is used to create web pages
but also mobile apps.

Nowadays, some libraries so populars like jQuery,
are being replaced by AngularJS. Making them almost obsolete.

```html
<!doctype html>
<html ng-app>
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
  </head>
  <body>
    <div>
      <label>Name:</label>
      <input type="text" ng-model="yourName" placeholder="Enter a name here">
      <hr>
      <h1>Hello {{yourName}}!</h1>
    </div>
  </body>
</html>
```

## Overview 

[AngularJS](http://angularjs.org/)
is one of the most amazing 
frameworks to develop web applications.
It ties HTML code to Javascript data structures.
The best of it is that it works
like magic (of course, no magic involved, only
lots of comparisons).

## Works like a game engine

AngularJS works like a game engine:
it has a engine loop that updates and draws
everything.

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

## Lots of libraries

AngularJS have lots of external modules. Some of them are:

- [Google Analytics in AngularJS](http://stackoverflow.com/questions/10713708/tracking-google-analytics-page-views-with-angular-js)

Bootstrap + AngularJS:

- [Angular Strap](http://mgcrea.github.io/angular-strap/)
- [Bootstrap UI](http://angular-ui.github.io/bootstrap/)
- [UI Utils](https://github.com/angular-ui/ui-utils)
- [UI Router](https://github.com/angular-ui/ui-router)
  
## Other

How to control route changes and avoid false redraws: [here](http://www.youtube.com/watch?v=P6KITGRQujQ).
