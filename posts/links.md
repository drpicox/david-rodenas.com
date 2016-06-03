---
title: "Links"
subtitle: "Some interesting things"
tags:
  - links
date: 2016-06-02
abstract: >
    Here you will find some of the resources that I found interesting to share.
    Some of them are some of my libraries, 
    others are libraries that I use daily,
    and others are just interesting or amusing things.
    It is just like it was www in 90s.
snippet: |
    ```html
    <a href="http://david-rodenas.com">David Rodenas' Home</a>
    ```
---

## Barcelona Tech Meetups

* [AngularBeers](https://twitter.com/ngbeers): One-off meetup for networking, beers and socializing
* [AngularCamp](http://angularcamp.org/): Recurrent casual community Angular meetup.

## My AngularJS Components

* [as](https://github.com/angular/angular.js/pull/14080): a proposal directive to access component controllers (more [here](#!/posts/as-directive))
* [drpx-bind-angular](https://github.com/drpicox/drpx-bind-angular): bind angular string templates like ng-bind does with text
* [drpx-class-route](https://github.com/drpicox/drpx-class-route) / [demo](http://david-rodenas.com/drpx-class-route/demo.html): add classes depending the route
* [drpx-id](https://github.com/drpicox/drpx-id): access to components controllers from templates; _deprecated in favor of `as` directive_
* [drpx-seo](https://github.com/drpicox/drpx-seo): enable SEO to your SPA AngularJS apps without serverside support
* [drpx-storage](https://github.com/drpicox/drpx-storage) / [mock](https://github.com/drpicox/drpx-storage-mocks): angular wrapper for [mozilla localForage](https://github.com/mozilla/localForage)
* [drpx-transcludeto](https://github.com/drpicox/drpx-transcludeto) / [demo](http://david-rodenas.com/drpx-transcludeto/demo.html): multitransclussion for angular; _deprecated in favor of [ngTransclude 1.5](https://docs.angularjs.org/api/ng/directive/ngTransclude)_
* [drpx-updateable](https://github.com/drpicox/drpx-updateable): lazy compute derived data (better than [flux](https://facebook.github.io/flux/)); _deprecated in favor of [Observable](https://github.com/zenparsing/es-observable)_

## My Contributions inside Angular

* [fix(ngClass)](https://github.com/angular/angular.js/pull/14405): solves a bug of `ng-class="['orange', rgb]"` in which rgb is an object
* [feat($componentController)](https://github.com/angular/angular.js/commit/72b96ef57a28743e2dfed523701cc2e88e3b473b): implementation of an utility to help testing of component controllers, and [proposal](https://github.com/angular/angular.js/issues/13683#issuecomment-169417606)

## My current [proposals](https://github.com/angular/angular.js/pulls/drpicox) inside Angular

* [feat(asDirective)](https://github.com/angular/angular.js/pull/14080): a directive to attach component controller into the current controller
* [feat(ngTranscludeLocals)](https://github.com/angular/angular.js/pull/14386): an update to `ng-transclude` directive to allow pass values to transcluded elements
* [perf(ngClass)](https://github.com/angular/angular.js/pull/14404): a case optimization to avoid unnecessary copies

## Teaching

* [MVC Models](http://david-rodenas.com/posts/resources/Mvc%20-%20Model,%20the%20great%20forgotten.pdf): A step by step presentation showing what models are for
* [JSpatterns v1](http://david-rodenas.com/tutorial-jspatterns-v1/) / [pdf](http://david-rodenas.com/tutorial-jspatterns-v1/JSandPatterns.pdf): stop messing with dom
* [Angular for designers v1](https://github.com/drpicox/tutorial-angulardesigners-v1) / [demo](http://david-rodenas.com/tutorial-angulardesigners-v1/): small examples tutorial
* [Promises v1](http://david-rodenas.com/tutorial-promises-v1): first tutorial, it should be improved
* [Grunt v1](http://david-rodenas.com/tutorial-gruntjs-v1/#/grunt): small tutorial for grunt (quite old!)

## Web Apps Resources

* [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/): what are? how to make one? what are the strengths?
* [Service Worker Toolbos](https://github.com/GoogleChrome/sw-toolbox): A toolbox to create service workers
* [Google I/O 2016 Courses](https://codelabs.developers.google.com/io2016): Lot's of tutorials of the Google I/O 2016 workshops

## Browserify

[Browserify](http://browserify.org/) is a very powerful tool to create javascript bundles.
It accepts transforms in order to build an application. Here are some of my selected transforms (si [broather list](https://github.com/substack/node-browserify/wiki/list-of-transforms)):

* [babelify](https://github.com/babel/babelify): use ES2015
  ```
  $ npm i -D babelify babel-preset-es2015
  transforms.push(['babelify', {sourceMap: true, presets: ['es2015']}])
  [1,2,3].filter(x => x > 2);
  ```

* [browserify-ngannotate](https://github.com/omsmith/browserify-ngannotate): use ES2015
  ```
  $ npm i -D browserify-ngannotate babel-preset-es2015
  transforms.push('browserify-ngannotate')
  /* @ngInject */ function(myService) { ... }
  ```

* [envify](https://github.com/hughsk/envify): use compile time ENVIRONMENT VARIABLES
  ```
  $ npm i -D envify
  transforms.push('envify')
  if (process.env.ENVVAR) { ... }
  ```

* [stringify](https://github.com/JohnPostlethwait/stringify): require any html templates as strings
  ```
  npm i -D stringify
  transforms.push(['stringify', {'extensions': [ '.html' ], "minify": true}])
  var tpl = require('./my.tpl.html');
  ```

## Styles

* [Solved by Flexbox](http://philipwalton.github.io/solved-by-flexbox/): for IE10 or better, or how to keep design simple with flexbox