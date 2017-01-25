---
title: "AngularJS collect refactor try/catch"
tags:
  - contributions
  - angularjs
  - performance
  - compile
  - javascript
  - webpagetest
  - benchpress
  - angularjs-collect-EA
date: 2016-08-08
source: https://github.com/angular/angular.js/pull/14848
description: >
    This contribution was a small refactor, but
    with a big improvement in performance.
    It solved a compilation limitation of the browser
    so angular compile can go faster.
snippet: |
    ```javascript
    try { 
        ...
    } catch (e) {
        ...
    }
    ```
---

While I was optimizing the performance of one of my customers
website I have realized that the AngularJS library give
a lot of deoptimization warning flags.

After some research, I have seen that in the collect method
inside compile, it has a try/catch expression to handle one
random weird case of IE9.

It turns out that when the Javascript browser compiler finds 
a try/catch inside a function it does not optimizes that function.
Try/catch expression are difficult to handle by compilers
because they have a lot of runtime implications:

After some analysis I have seen something like this:

```javascript
function collect(...) {
    ...
    switch (...) {
        case ...: ... // lot of stuff
        case ...: ... // lot of stuff
        case ...: ... // lot of stuff
        case ...:
          try {
              ... // few stuff
          } catch (e) {}
    }
    ... 
}
```

The solution was simple, just create a specific function for the
case with few stuff, which was usually not executed:

```javascript
function collect(...) {
    ...
    switch (...) {
        case ...: ... // lot of stuff
        case ...: ... // lot of stuff
        case ...: ... // lot of stuff
        case ...: 
            collect_few_stuff(...);
        }
    ... 
}

function collect_few_stuff(...) {
    try {
        ... // few stuff
    } catch (e) {}
}
```

That solved the problem. 
After some testing with benchpress I have seen that
this simple solution improved the performance by a 5-15%.
