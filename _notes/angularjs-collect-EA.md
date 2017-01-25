---
title: "AngularJS collect only EA directives"
tags:
  - contributions
  - angularjs
  - performance
  - compile
  - javascript
  - webpagetest
  - benchpress
date: 2016-08-08
source: https://github.com/angular/angular.js/pull/14850
description: >
    This contribution already merged into AngularJS
    allows to deactivate the execution of comment
    and class directives and boost the performance
    of the page boot and components compilation time.
snippet: |
    ```javascript
    app.config(function($compileProvider) {
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);
    });
    ```
---

The first thing that happens when an AngularJS starts
is that it has to compile the web page: 
it looks for `ng-app` directives and then compiles
all Angular expressions contained.

In SPAs this time is not very large, because pages are small,
but pages rendered in server-side with PHP/JSP/ASP/... 
can be really large and contain lots of expressions.

While I was working with a customer I realized that just the boot
operation of Angular toke more than 1 second. 
After some more analysis I have realized that Angular expended
lot of time in the compile function.
Looking to compile function and analyzing its tasks I discover
that looking for directives in comments and classes took a lot of time.

The reason is simple: classes and comments have to be parsed by Javascript, 
entities and attributes are parsed by the browser, which is faster.
And although in production code there are no comments, they indeed have 
lots of classes.

Because of this, I modify compile and I add a configuration option
to inhibit the compilation of comment and class directives.
I also have provided of a set of tests to verify that they are working
correctly. 
And I also have provided a benchpress suite test case to 
demonstrate and compute the total performance improvement.

This optimization does not only improve the performance of the application
boot, but also improves the time of component compilation. 
That means that any change in the view, new page view, new component,
new elements on the screen... appears faster.

After doing some benchmark, the total speed improvement was around 10-20%.
