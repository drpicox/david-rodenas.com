---
title: "Improve performance: do not compile class and comment directives"
tags:
  - angularjs
  - performance
  - production
  - contributions
  - benchpress
date: 2016-08-28
description: >
    Since Angular 1.5.9 it is possible to instruct angular to ignore
    css class and comment directives.
    By doing this you can achieve better performance in the application
    bootstrap and in directive compilation.
    With just one configuration you can speedup your applications 
    around a 10~20%.
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

Add jut one configuration to your Angular project
and it will be automatically accelerated.

But be carefull, it have a catch: it introduces breaking changes.
But do not worry, I am almost sure that it does not have impact on you.


Directives and restrict
-----------------------

Angular directives can be used in four declaration styles:

- `E` - Element name (default): `<my-directive></my-directive>`
- `A` - Attribute (default): `<div my-directive="exp"></div>`
- `C` - Class: `<div class="my-directive: exp;"></div>`
- `M` - Comment: `<!-- directive: my-directive exp -->`

Almost all apps only uses element and attribute directives.
Most of style guides [recommend](https://github.com/johnpapa/angular-styleguide/tree/master/a1#style-y074) 
use only element and attribute directives.

Class and comment directives are unused and unknown for
many of Angular developers.  


Angular template compilation
----------------------------

Angular basically compiles templates, _html_.
It happens in two mainly cases:

- when your app starts (bootstrap): 
  it compiles the page itself

- when you show a new visual element (directive with template): 
  it compiles the directive template

During this compilation, Angular looks for all directives present in the _html_,
including those inside class and comments.

Although production code usually does not contain comments, 
it has lots of classes. 
That means that Angular look inside classes (and comments) trying
to find directives, even if we are not using them in our application.


Do not compile class and comment directives
-------------------------------------------

But remember, almost all projects only use element and attribute
directives.
So, why not just hint angular to not compile class and comment directives?

By doing this angular will skip all checks 
inside element classes and comments
and will make compilations faster.  

Now you can disable class and comment directives adding
this configuration:

```javascript
angular
  .module('yourApp', [ /* ... */ ])    
  .config(function($compileProvider) {
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
  });
```

This configuration just tells Angular that element class directives
and comment directives can be ignored, so Angular will be faster
executing your App. 


Be aware of the breaking changes
--------------------------------

Ok, as I said, you probably should not care about breaking
changes. 
But let me do a simple check to make sure.

This configuration allows you to define 
`'C'` or `'M'` restrictions in your directive. 
But Angular will ignore them.

> Check your directives if any is using restrict `'C'` or `'M'`.

If you are using them you have two options:
- a) change your templates and directive definitions to use only 
entity and attribute directives,
- or b), do not disable commend and css class directives, but
you will not have a boost in performance. 

> Check third part libraries

Using `'C'` or `'M'` goes against Angular style guides, 
but because it works there are few libraries that just ignore
these guidelines and use  them.
If this happens, you may want to change the library 
or use a newer version.


Be ready for the future
-----------------------

Now comment and css class directives are enabled by default.
It is possible that a future version of Angular 1.x will change
the policy and make them disabled by default.

Use only element and attribute to avoid future compatibility problems.

It is worthy to remember that since Angular 1.3 all
directives default `restrict` changed from `'EAC'` to
`'EA'`.


Is it really faster?
--------------------

Yes!

Claims in performance gains here presented are 
evaluated with benchpress.

You can run by your own the experiments that I have built with
the benchpress benchmark.
The code is inside AngularJS, git repo
[bootstrap-compile-bp](https://github.com/drpicox/angular.js/tree/4bde7677b705b7cc380bb92dcf57ba411cecdd6e/benchmarks) . 


More information
----------------

- the official documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.
- my [contribution](https://github.com/angular/angular.js/pull/14850) inside Angular.JS
