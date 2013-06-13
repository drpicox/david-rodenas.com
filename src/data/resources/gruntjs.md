---
icon: puzzle-piece
logo: images/resources/gruntjs.png
title: GruntJS
abstract: >
  GruntJS is the *Makefile*
  for static web projects.
  It combines multiple
  technologies into a single
  tool.

tags:
  - apps  
---
## Overview

[GruntJS](http://gruntjs.com/)
is not a really good piece
of technology, not even the most well designed,
but it accomplish its finality:
compile a whole web application using a single command.

    :::term
    $ grunt dist

For those who are comming from C and C++ world, 
grunt is a kind of 
[make](https://en.wikipedia.org/wiki/Make_(software\)) 
tool, 
but instead defining rules, you must define tasks.

## Installing Grunt

### Prerequisites

Grunt is a 
[node.js]
application, 
it requires [node.js] and [npm].

In Ubuntu use the following ppa to have the newest version:

    :::term
    $ sudo apt-get update
    $ sudo apt-get install python-software-properties "python" "g++" "make"
    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get update
    $ sudo apt-get install "nodejs"

Npm is installed with the node.js.

### Install GruntJS

Install GrunJS (`grunt-cli`) using the npm package manager:

    :::term
    $ npm install -g "grunt-cli"
    

## Set up your project

### Create a package.json

If you do not have one, 
create a `package.json` to use GruntJS 
in your app or web page.
It must be in the root directory of your project
and describes your project and its dependences with NodeJS.
You can use the following as initial `package.json`:

    :::javascript
    {
      "name": "Your_Project",
      "version": "1.0.0",
      "dependencies": {},
      "devDependencies": {},
      "engines": { "node": ">=0.8.0" }
    }

Details can be found in 
[package.json specifics](https://npmjs.org/doc/json.html).

### Create a Gruntfile

The Gruntfile describes 
which tasks do you want to automatize.
It must be in the same directory than `package.json`.

Create `Gruntfile.coffee` 
in the root directory of your project
as follows:

    :::coffeescript
    # Gruntfile.coffee
    module.exports = (grunt) ->
      # here your gruntfile contents code using grunt API

This file is a NodeJS program that uses grunt
as a API library. 

If you want you can use a `Gruntfile.js` file 
instead of a `Gruntfile.coffee`,
that means that your project tasks
descriptions must be done in Javascript instead
of Coffeescript.

    :::javascript    
    /* Gruntfile.js: javascript ALTERNATIVE version of the skeletton */
    module.exports = function (grunt) {
      /* here your gruntfile contents using grunt API */
    };

<div class="alert alert-info">
I rather preffer to use <code>Gruntfile.coffee</code>
instead of <code>Gruntfile.js</code> because it is more
close to a <em>Makefile</em> and I feel more confortable.
Anyway the philosophy of the <em>Gruntfile</em> and 
the <em>Makefile</em> are really different, and compare
both can create missunderstoods.
</div>

### Install grunt library

Grunt is both, command line app and a library. 
Add grunt package to your app:

    :::term
    $ npm install --save-dev "grunt"

### Adding package tasks to GruntJS

Grunt is just a task manager. 
Taks and actions to be performed must be programmed.
There are lots of grunt task packages
available 
(the *official* supported are listed 
[here](https://github.com/gruntjs/grunt-contrib),
and you can use them with a little effort.

<div class="alert alert-info">
Each extension has its own options and functionalities,
please, read the documentation of each one.
</div>

To add an extension install the standard npm package
and save it to your `package.json`
(as example the concat task):

    :::term
    $ npm install --save-dev "grunt-contrib-concat"

> The `--save-dev` adds the dependence directly to your
> `package.json` as development dependence.

Load the package task from the Gruntfile:

    :::coffeescript
    grunt.loadNpmTasks 'grunt-contrib-concat'

### Automatize package tasks loading

Most grunt package tasks are installed as
development dependences and its name begins with *grunt*.
Using `matchdep` you can load them automatically
from your `package.json`. 

First install the `matchdep` package:

    :::term
    $ npm install --save-dep "matchdep"

And then use it from the `Gruntfile.coffee` 
to automatically load grunt plugins:

    :::coffeescript
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

It loads all package.json developer libraries that starts with `grunt-`.
If you have some weird named grunt plugin you can load manually as follows:

    :::coffeescript
    # Load one grunt plugin manually
    grunt.loadNpmTasks 'weird-plugin-name'

## Using GruntJS

### Plan your taks

Tasks will do all the job,
basically it will automatize something 
that you usually do manually command by command.
The idea behind of grunt is to 
composite a sequence of taks into 
one single larger task.
Basic taks are usually package taks, so
you usually only need to concatenate them:
copy and minimize all css files (*grunt-contrib-cssmin*),
copy and minimize all images (*grunt-contrib-imagemin*),
copy, concatenate and compress all javascript files 
(*grunt-contrib-uglify*),
and copy and compress all html files (*grunt-contrib-htmlmin*).
You should use a `public/` directory or so with
the results of all tasks.
Write down in a paper what do you want to achieve
and how, and put name to your tasks.

Make sure that you have all grunt task packages 
that you need.

### Configure package tasks

Package tasks are generic and they must be configured.
For each tasks you have to specify what files
are affected, and you may add some options. 
Configurations are added to your
`Gruntfile.coffee` with a call to grunt:

    :::coffeescript
    grunt.initConfig
      cssmin:
        publify:
          options:
            report: 'min'
          files:
            'public/styles/presentation.css': 'src/styles/presentation.css'
            'public/styles/docs.css': 'src/styles/docs.css'
            'public/styles/section.css': 'src/styles/section.css'
      # other package taks configurations will be here

### Create grunt taks as list of tasks

Define tasks as a **sequential** execution of many 
other tasks in your `Gruntfile.coffee`:

    :::coffeescript
    grunt.registerTask 'public', ['cssmin','imagemin','uglify','htmlmin']

It can be executed as:

    ::term
    $ grunt public

### Define the default task

If you want `public` to become the default action, 
define a new task called 'default':

    :::coffeescript
    grunt.registerTask 'default', ['public']

Now grunt can be invoked without arguments:

    :::term
    $ grunt


## Templates

### package.json

    :::javascript
    {
      "name": "Your_Project",
      "version": "1.0.0",
      "dependencies": {},
      "devDependencies": {},
      "engines": { "node": ">=0.8.0" }
    }

### Npm installs

    :::term
    $ npm install --save-dev             \
	          "grunt"                    \
	          "matchdep"                 \
			  "grunt-contrib-clean"      \
			  "grunt-contrib-concat"     \
			  "grunt-contrib-connect"    \
			  "grunt-contrib-copy"       \
			  "grunt-contrib-clean"      \
			  "grunt-contrib-cssmin"     \
			  "grunt-contrib-htmlmin"    \
			  "grunt-contrib-imagemin"   \
			  "grunt-contrib-less"       \
			  "grunt-contrib-uglify"     \
			  "grunt-contrib-watch"

### bower.json

    :::javascript
    {
      "name": "Your_Project",
      "version": "1.0.0",
      "dependencies": {},
      "devDependencies": {}
    }
	
### bower.rc

	:::javascript
	{
	    "directory": "src/components",
	    "json": "bower.json"
	}   



<!-- References -->
[node.js]: (http://nodejs.org/) "NodeJS site"
[npm]: (https://npmjs.org/) "NPM library catalog"
