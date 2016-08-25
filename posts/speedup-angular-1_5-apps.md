---
title: "Speedup your Angular 1.5.9 application"
subtitle: "You can make your apps faster with one just simple configuration"
tags:
  - angular
  - performance
  - production
  - contribution
date: 2016-08-25
abstract: >
    Learn how to speedup your applications around a 10~20%
    with just one small configuration.
snippet: |
    ```javascript
    angular
      .module('yourApp', [])    
      .config(function($compileProvider) {
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);
      });
    ```
---

Previous status
---------------

Nowadays application does not usually use class directives neither comment directives:

```html
  <!-- directive: a-comment-directive -->
  <div class="a-class-directive"></div>
```

Although this fact, before angular 1.5.9 it always looked for directives 
inside comments and classes.

I have performed some benchmarks using benchpress and templates from bootstrap 
that shows that the angular compiler spends around a 10~20% of the time looking 
for directives inside classes and directives.
See [bootstrap-compile-bp](https://github.com/drpicox/angular.js/tree/4bde7677b705b7cc380bb92dcf57ba411cecdd6e/benchmarks) 
to replicate the experiment.



Current status
--------------

I have implemented inside angular ([details here](https://github.com/angular/angular.js/pull/14850))
a configuration that disables class and comment directives.

If you are sure that your application and related libraries 
use only entity and attribute components and directives
then you can disable class and comment directives for the whole application:

```javascript
angular
  .module('yourApp', [ /* ... */ ])    
  .config(function($compileProvider) {
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
  });
```

By doing this you will experience a faster boostraps (the time to start the application)
and faster compilations (the time to create new elements in views).

This configuration does not change how you specify directives, 
angular just ignore restrict 'M' and restrict 'C' from directives DDOs. 

Before apply this configuration you have to be suere that you are not using class neither 
comment directives. The configuration is applied for the whole application.


More information
----------------

You can consult the original documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.
