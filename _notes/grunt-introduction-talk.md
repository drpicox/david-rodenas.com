---
title: "Introduction to Grunt"
website: http://david-rodenas.com/tutorial-gruntjs-v1/#/grunt
image: 
  src: /assets/images/grunt-one-single-command.jpg
  width: 763
  height: 568
tags:
  - talks
  - gruntjs
  - performance
  - bcnjs
description: > 
  This talk goes back to 2013.
  Then was really difficult to have an optimised web.
  There was too many tools, none integrated.
  Then I have discovered grunt, able to compres
  html css and js files, everything in one single command.
---

It was a great deal to have an optimized web before 2013.
There was too many steps to perform manually, 
or it was difficult to create a script or makefile.

Then it appeared `grunt`, 
a command that was able to integrate many tools
into a single command.

Although it was beta, it was easy to configure and
easy to use.

Following my live motive 
_If you have learned something interesting, make a speech and share it_
I make an speech and presented it in the BarcelonaJS
meetup that existed in these time.

It has around 100 attendees, and it was very well received.
The presentation was divided in three parts:

- one explaining what is grunt
- another one explaining philosophy and strategy to use grunt
- and a live code session optimizing an existing website

```javascript
/** Gruntfile.js */
module.exports = function(grunt) {

  // Project tasks configurations
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    
    // (C) Tasks configurations here
  });

  // (L) Load here grunt plugins with tasks

  // (T) Add here your task(s) 
  grunt.registerTask('default', []);
};
```

Nowadays I still use the template that I have presented to build quick grunt configurations.
