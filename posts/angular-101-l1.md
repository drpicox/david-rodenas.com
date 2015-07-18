---
title: "Angular 101 - L1"
subtitle: "The right place to start building your own web apps"
tags:
  - teaching
  - angular
date: 2015-07-16
abstract: >
    The most difficult part to start with one technology is
    just that: start.
    This small article shows the necessary steps to start:
    how to create a simple web page with angular, 
    how to start a web server and use it,
    how to add few nice styles, 
    and how to create your first angular component.
    It does not try to explain everything in detail, 
    it is just a start.
snippet: |
    ```html
    <button ng-click="vm.sayHello()">Say hello</button>
    <div>{{vm.hello}}</div>
    ```
---

## Chapter 1: First angular app

This is a small example just to see the fundamentals of angular.
Follow it step by step and you will the most basic angular app running.

1. Create a folder (example angular-101-l1). 
2. Inside create a file called `index.html`:

	```
	- angular-101-l1/
	  - index.html
	```

3. Fill `index.html` with the following content:

	```html
	<html>
	  <head><title>Angular 101 - L1</title></head>
	  <body ng-app>
	  	<!-- load angular library -->
	  	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular.js"></script>

	  	<!-- hello, angular takes control and adds its magic below -->
	  	<button ng-click="vm.hello = 'hello'">Say hello</button>
	  	<div>{{vm.hello}}</div>
	  </body>
	</html>
	```

4. Open index.html with your browser (example: double click or drag the file to the browser).

  ![button unpressed](posts/images/angular-101-l1-ch1-4.png)

5. You will see a button, click on it.

  ![button pressed](posts/images/angular-101-l1-ch1-5.png)

Congratulations! You have done your first angular app!


## Chapter 2: Setting up a web server

You do not want you browser messing with your files:
getting your private data and pushing it to web servers
of pages that you are visiting.
Because of this, browser limits the amount of things
that you can do with files (file://), and because of
this, we need to set up a web server.

We are going to install a nodejs web server.
You may have already a web server (an Apache, nginx, ...),
they are fine, ut in long term, 
you will need to get familiar with nodejs tools.
So please, follow the next steps.

1. Install nodejs: https://nodejs.org/

2. Open a console window.
	- Windows: push 'Windows Key'+'R' at the same time and then write `cmd` and enter.
	- Mac: search for app called `Terminal` and start it.
	- Linux: open a terminal.

    > We will use a lot the console window, so put it in some place handy to find.

3. Execute the following command in the console:

    ```bash
    # in windows do not use sudo
    $ sudo npm -g install http-server
    ```

4. Go to the directory that we have created in chapter 1, angular-101-l1, ex:

    ```bash
    $ cd Documents/angular-101-l1
    ```

	Make sure that you have changed successfully of directory, ex:

	```bash
	# use dir instead of ls in windows
	$ ls
	index.html
	```

5. Execute the http-server in that folder:

	```bash
	$ http-server -c-1 -p 8080
	```

6. Open http://localhost:8080/ in your browser.

7. Click in hello world.

  ![button pressed on web](posts/images/angular-101-l1-ch2-7.png)


Congratulations! Now you have your angular app running in your own node web server!


## Chapter 3: Your first directive.

Chapter 1 example was very small, just a proof of concept. 
Now it is time to start and use few angular basics.
Angular works with directives. 
Directives are small pieces of your app that can be composited
to create a larger app.

1. Create the following directory structure:

	```
	- angular-101-l1/
	  - index.html
	  - helloApp.js
	  - HelloDirective.js
	  - HelloDirective.tpl.html
	```

2. Fill `index.html` with the following content:

	```html
	<html>
	  <head><title>Angular 101 - L1</title></head>
	  <body ng-app="helloApp">
	  	<!-- load angular library -->
	  	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular.js"></script>
	  	<script src="helloApp.js"></script>
	  	<script src="HelloDirective.js"></script>
	  	
	  	<!-- hello, your small piece (directive) that does the hello -->
	  	<ha-hello></ha-hello>
	  </body>
	</html>
	```

3. Create the helloApp module inside `helloApp.js`:

	```javascript
	// This is the declaration of the main app
	angular.module('helloApp', []);
	```

4. Create the helloApp hello directive (&lt;ha-hello>) inside `HelloDirective.js`:

	```javascript
	(function() {
		'use strict';

		angular
			.module('helloApp')
			.directive('haHello', HelloDirective);

		function HelloDirective() {
			var directive = {
				restrict: 'E',
				templateUrl: './HelloDirective.tpl.html',
				scope: {},
				controller: HelloController,
				controllerAs: 'vm',
			};

			return directive;
		}

		HelloController.$inject = [];
		function HelloController  () {
			var vm = this;

			vm.hello = '';
			vm.sayHello = sayHello;

			function sayHello() {
				vm.hello = 'hello!';
			}
		}
	})();
	```

5. Create the <ha-hello> directive template inside `HelloDirective.tpl.html`:

	```html
	<!-- here you write your directive template -->
	<button ng-click="vm.sayHello()">Say hello</button>
	<div>{{vm.hello}}</div>
	```

6. Execute the http-server in that folder:

	```bash
	$ http-server -c-1 -p 8080
	```

7. Open http://localhost:8080/ in your browser.

8. Click hello world.


Congratulations! 
You have done your first directive and you are ready to 
unleash the power of web programming.

Imagine, create an app with just composing small pieces,
or even better, larger pieces composed of smaller ones.
Header piece, footer piece, cart list piece, product item piece,
recommendation list piece, ...

But before...

## Chapter 4: be stylish

It is nice to do a button, but it is nicer to create a very nice button.
There are lots of frameworks to create web pages (like http://getbootstrap.com)
or web apps (like https://material.angularjs.org/).

We will start with bootstrap, to know all that you can do with it, 
just visit and watch:

- http://getbootstrap.com
- http://getbootstrap.com/css/ for basic styles,
- http://getbootstrap.com/components/ for components,
- http://getbootstrap.com/javascript/ for advanced components.

And now, start using it!

1. Modify the `index.html` from Chapter 3 to add Bootstrap:

	```html
	<html>
	  <head>
	  	<title>Angular 101 - L1</title>
	  	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	  </head>
	  <body ng-app="helloApp">
	  	<!-- load angular library -->
	  	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular.js"></script>
	  	<script src="helloApp.js"></script>
	  	<script src="HelloDirective.js"></script>
	  	
	  	<!-- hello, your small piece (directive) that does the hello -->
	  	<br>
	  	<div class="container">
	  		<ha-hello></ha-hello>
	  	</div>
	  </body>
	</html>
	```

2. Modify `HelloDirective.tpl.html` to use Bootstrap.

	```html
	<!-- here you write your directive template -->
	<div class="jumbotron">
	  <h1>{{vm.hello}}</h1>
	  <p>
	  	This is your first angular app, 
	  	with directives, and stylish.
	  </p>
	  <p>
	  	<button class="btn btn-primary btn-lg" ng-click="vm.sayHello()">Say hello</button>
	  </p>
	</div>
	```

3. Start the http-server again.

4. Open http://localhost:8080 in your browser

  ![button pressed on web](posts/images/angular-101-l1-ch4-4.png)


Nice! Much better now, right? And with very little effort!


## Recap

In chapter 1 you just have seen the basics of Angular working. 
It includes Angular from CDN (it loads Angular from internet),
and you are able to create a very basic Angular app that runs
directly from your hard disk.

In chapter 2 you install all the nodejs environment, very helpful
for developers, and a very basic http-server. 
What is the best of http-server? 
It is very light and has almost no configuration.

In chapter 3 you unleash the power of directives.
Imagine to build a very large app in one single page, 
thinking in every detail at the same time, insane!
Now you have created you first directive, and you know
that you can break your app in small pieces. Better, right?

And finally in chapter 4 you just have added some style.
It was about time, right? Now you know that you can 
do pretty things with low effort.

The source code of all examples is here:

- https://github.com/drpicox/angular-101-l1


## Questions?

Do you have any question? Tweet me and I'll try to append here the answer.

  - Q. Do you see this error?

	```bash
	$ http-server -c-1 -p 8080
	events.js:85
	      throw er; // Unhandled 'error' event
	            ^
	Error: listen EADDRINUSE
	    at exports._errnoException (util.js:746:11)
	    at Server._listen2 (net.js:1129:14)
	    at listen (net.js:1155:10)
	    at net.js:1253:9
	    at dns.js:85:18
	    at process._tickCallback (node.js:355:11)
	    at Function.Module.runMain (module.js:503:11)
	    at startup (node.js:129:16)
	    at node.js:814:3
	```

	That means that you have the http-server is already running.

	Please, look if you have this opened in other window,
	stop it with `Ctrl+C`, and start again.

	The problem persits? Change 8080 by any other number
	greater than 2000 until it works. Keep in mind that
	instead of using http://localhost:8080/ you should
	use http://localhost:2000/ where 2000 is your new number.

  - Q. Do you see strange brackets?

    ![button pressed on web](posts/images/angular-101-l1-Q-A.png)

    That probably means that angular is not properly loaded.
    Use your browser developer tools (F12, `Ctrl+Shit+I`, `Cmd+Alt+I` on Mac)
    to see what is going on network.

    If you see something like these:

    ![button pressed on web](posts/images/angular-101-l1-Q-B.png)

    ![button pressed on web](posts/images/angular-101-l1-Q-C.png)

    you probably do not have internet connection.
    Check it, if everything goes well you should see something like:

    ![button pressed on web](posts/images/angular-101-l1-Q-D.png)

    ![button pressed on web](posts/images/angular-101-l1-Q-E.png)

  - Q. Do you used IE?

  	Bad idea. Try to use Chrome, Firefox or Chromium.

  - Q. Do you have problems with npm and you are stuck?

    Just try with Firefox.
    It can work with chapter 4 without an http-server.

    Anyway, I strongly recommend to have npm tools installed,
    so try to figure up what is going on. 
    Do you have a firewall?
    Do you have a proxy?

  - Q. Nothing works?

    Download the repository from https://github.com/drpicox/angular-101-l1
    and start it opening index.html with Firefox.



