---
title: "Links"
subtitle: "Some interesting things"
tags:
  - links
date: 2016-03-04
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

* [as](https://github.com/angular/angular.js/pull/14080): a propossal directive to access component controllers (more [here](#!/posts/as-directive))
* [drpx-bind-angular](https://github.com/drpicox/drpx-bind-angular): bind angular string templates like ng-bind does with text
* [drpx-class-route](https://github.com/drpicox/drpx-class-route) / [demo](http://david-rodenas.com/drpx-class-route/demo.html): add classes depending the route
* [drpx-id](https://github.com/drpicox/drpx-id): access to components controllers from templates (see `as` directive)
* [drpx-seo](https://github.com/drpicox/drpx-seo): enable SEO to your SPA AngularJS apps without serverside support
* [drpx-storage](https://github.com/drpicox/drpx-storage) / [mock](https://github.com/drpicox/drpx-storage-mocks): angular wrapper for [mozilla localForage](https://github.com/mozilla/localForage)
* [drpx-transcludeto](https://github.com/drpicox/drpx-transcludeto) / [demo](http://david-rodenas.com/drpx-transcludeto/demo.html): multitransclussion for angular
* [drpx-updateable](https://github.com/drpicox/drpx-updateable): lazy compute derived data (better than [flux](https://facebook.github.io/flux/))

## Teaching

* [MVC Models](http://david-rodenas.com/posts/resources/Mvc%20-%20Model,%20the%20great%20forgotten.pdf): A step by step presentation showing what models are for
* [JSpatterns v1](http://david-rodenas.com/tutorial-jspatterns-v1/) / [pdf](http://david-rodenas.com/tutorial-jspatterns-v1/JSandPatterns.pdf): stop messing with dom
* [Angular for designers v1](https://github.com/drpicox/tutorial-angulardesigners-v1) / [demo](http://david-rodenas.com/tutorial-angulardesigners-v1/): small examples tutorial
* [Promises v1](http://david-rodenas.com/tutorial-promises-v1): first tutorial, it should be improved
* [Grunt v1](http://david-rodenas.com/tutorial-gruntjs-v1/#/grunt): small tutorial for grunt (quite old!)

## Browserify

[Browserify](http://browserify.org/) is a very powerful tool to create javascript bundles.
It accepts transforms in order to build an application. Here are some of my selected transforms (si [broather list](https://github.com/substack/node-browserify/wiki/list-of-transforms)):

* [envify](https://github.com/hughsk/envify): `npm i -D envify`, `if (process.env.ENVVAR) { ... }`
* [stringify](https://github.com/JohnPostlethwait/stringify): `npm i -D stringify`, `"stringify": { "extensions": [ ".html" ],`

`"browserify": { "transform": [ ... ] }`

## Styles

* [Solved by Flexbox](http://philipwalton.github.io/solved-by-flexbox/): for IE10 or better, or how to keep design simple with flexbox