---
title: "Angular 2.0-beta modules"
tags:
  - talks
  - angular
  - community
  - github
  - typescript
image: /assets/images/modules-in-angular-1.jpg
image_width: 638
image_height: 479
description: >
  A talk without slides showing actual code 
  showing how to create Angular 2 modules
  and injection.
  Implemented in ES5 and Typescript.
website: http://www.slideshare.net/DavidRdenasPic/modules-in-angular-20-beta1
---

This talk was given in the un-conference of AngularCamp in 2016.

By then there was very little information about how to work with 
Angular2 and almost no information about how to scale large applications.

I consider (like packages in java) modules
the native way to scale applications in Angular:
each part in the application is a small module, and modules cooperate among 
them to create the larger app.

Unfortunately there was very little information about how to define
such modules. 

I did some research, made some tests, and I discovered some things that
I presented in this talks:

- how to create barrels with enough information to represent a module (or package), including how to import and export them,

- how to inject dependencies inside other services (there was no example available by then),

- how, when and why use decorations, and because typescript, it is mandatory in order to provide automatic type annotation of class constructor,

- how to use ES5, because there was (and still there isn't) many examples in ES5


I created two examples and I presented them in the AngularCamp unconference.

Both examples are:

- [The Doctor Is - Typescript](https://github.com/drpicox/angular2-thedoctoris-ts)
- [The Doctor Is - ES5](https://github.com/drpicox/angular2-thedoctoris-es5)
