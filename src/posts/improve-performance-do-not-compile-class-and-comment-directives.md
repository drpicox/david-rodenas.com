---
title: "Improve performance: do not compile class and comment directives"
subtitle: "Disable css class and comment directives to improve your app performance"
tags:
  - angular
  - performance
  - production
  - contribution
  - benchpress
date: 2016-08-25
abstract: >
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

¿What if I told you that you can improve your app performance 
just adding one configuration to your code?

Thanks to my [contribution](https://github.com/angular/angular.js/pull/14850) 
now you can. But be careful: the reason because it is a configuration is
because it introduces breaking changes.


Directives and restrict
-----------------------

Angular directives can be used in four declaration styles:

- `E` - Element name (default): `<my-directive></my-directive>`
- `A` - Attribute (default): `<div my-directive="exp"></div>`
- `C` - Class: `<div class="my-directive: exp;"></div>`
- `M` - Comment: `<!-- directive: my-directive exp -->`

Nowadays, almost all apps only uses element and attribute directives,
and some guide style [recommends](https://github.com/johnpapa/angular-styleguide/tree/master/a1#style-y074) 
use only element and attribute directives.


Angular template compilation
----------------------------

When your app starts (bootstrap) or when you show a new visual element (directive with template)
angular compiles the corresponding _html_.

During this compilation, Angular looks for all directives present in the _html_,
including those inside class and comments.

Although production code usually does not contain comments, 
it contains lots of classes. 
That means that Angular look inside classes (and comments) trying
to find directives, even if we are not using them in our application.


Improve performance: do not compile class and comment directives
----------------------------------------------------------------

In this scenario the performance improvement is simple: 
just hint angular to not compile class and comment directives.
By doing this angular will skip all checks 
inside element classes and comments
and will perform compilation faster.  

You can disable element class and comment directives adding
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

With this configuration you can still define 
`'C'` or `'M'` restrictions in your directive, 
but Angular will just ignore them.

Nowadays it is unlikely that your _html_ templates
relays in class or comment directives, 
but if you are using them you have two options:
- a) change your templates and directive definitions to use only 
entity and attribute directives,
- or b), do not disable commend and css class directives, but
you will not have a boost in performance. 

You should also check for third party libraries. 
It is possible that you may use some library that 
uses comment or css class directives in their templates.
If this happens, you may want to change the library 
or use a newer version.


Be ready for the future
-----------------------

Now comment and css class directives are enabled by default.
It is possible that a future version of Angular 1.x will change
the policy and make them disabled by default.
If this happens, and you use any of them 
you will need to enable them in a configuration.

Anyway the best advice is 
**do not use comment or css class directives**,
so this change will never break your code.    

It is worthy to remember that since Angular 1.3 all
directives default `restrict` changed from `'EAC'` to
`'EA'`.


Be a pro: replicate benchmarks in your browser
----------------------------------------------

Claims in performance gains here presented are 
evaluated with benchpress.

You can replicate the experiments that I have built with
the benchpress benchmark inside AngularJS git repo
[bootstrap-compile-bp](https://github.com/drpicox/angular.js/tree/4bde7677b705b7cc380bb92dcf57ba411cecdd6e/benchmarks) 
to replicate the experiment. 


More information
----------------

You can consult the official documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.
