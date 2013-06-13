---
icon: html5
title: David Rodenas Home Page
abstract: >
  This is the project of this web page.
  It combines cutting-edge web app technologies to create
  a fast and appealing web page.
url: "http://david-rodenas.com"
source: "https://github.com/drpicox/david-rodenas.com"
relevance: 5
tags:
  - javascript
  - markdown
  - gruntjs
  - bowerjs
  - coffeescript
  - html5
  - bootstrap
  - lesscss
  - angularjs
  - yaml
  - apps
---
## Overview

This is the **project** of this web page.

I really believe that web page rendering should be
done in the browser side, server side should only
be used to send and get data. Because of this
for a long time I have been building 
build web pages using Javascript to increase their speed. 
But most of the solutions were not standar
and 100% maintained by me.

For the first time I have available all standard
tools required to build a web site as I have expected
since '99. The best of it: 
all tools are mantained by the community,
and others can collaborate, even if their 
are not Javascript developers.

## Project structure

### File directory

This project is basically a static web page.
It combines lesscss, html, javascript, and images
to generate a web page.

The directory structure is the following:

    :::bash
	/package.json             # npm package description
	/bower.json               # Bower package description
	/.bowerrc                 # Bower configuration
	/Gruntfile.coffee         # GruntJS file to build the website
	/src                      # Folder with sources to build the web
	/src/index.html           # Main html file container for everything
	/src/views/*.html         # AngularJS views for each web section
	/src/data/*/*.md          # Markdown files with contents of the web
	/src/styles/*.less        # LessCSS files with the style of the web
	/src/images/*.{png,jpg}   # My .png and .jpg images for the web
	/src/scripts/*.coffee     # AngularJS controller&co. scripts
    /src/components           # Bower installed web packages
	/debug                    # Build with all debug information
	/dist                     # Build compressed ready to deploy

<!-- */ <- this is here because of bash -->
### GruntJS tasks

The project is built with
<resource-link basename="gruntjs"></resource-link>.
It has three main tasks:

- **debug**: build the contents of the debug directory, 
  a browsable web without compression and with all
  debug information,
- **server**: runs the *debug* task, starts a web
  server in [http://localhost:9001](http://localhost:9001)
  with *livereload*, and starts a *watch* task.
- **dist**: runs the *debug* task, and compress
  all the web from `debug/` to `dist/`.

### index.html

`index.html` is the main controller/view of the project.
There is no other html file dirctly accessible 
from the user perspective. 
This html is a dynamic web page that will load the 
content for all sections.

**Javascript and stylesheet files** are concatenated
into two pairs of files (one for libraries and another
for custom sources). Concatenated (and compressed) files
are retrieved through wildcards, so any additional file
is automatically concatenated and added by GruntJS.
It is important to notice that built files do not
correspond with source files.

    :::html
	&lt;!-- stylesheets files are compressed to two files --&gt;    
	&lt;link href="third-party.css" rel="stylesheet"&gt;
    &lt;link href="styles.css" rel="stylesheet"&gt;
    ...
	&lt;!-- scripts files are compressed to two files --&gt;    
    &lt;script src="third-party.js"></script>
    &lt;script src="app.js"></script>


**Home page** is included inside the `index.hmtl` itslef
to speedup the loading of the landing page. 
It is hide or shown by AngularJS automatically
using the current location. By default is hidden to avoid 
weird flashes if other content is requested:

    :::html
    &lt;!-- Homepage inlined in index.html shown only if Homepage -->
    &lt;div ng-show="showHome" style="display:none">
      &lt;!-- showHome is computed at src/scripts/home-route.coffee -->

**Other sections** are loaded by AngularJS 
using routes from the `src/views/` directory.
Contents are placed inside the `ng-view`directive.

    :::html
    &lt;!-- Other sections are loaded inside this div -->
    &lt;div ng-view>&lt;/div>
	
**Navigation bar** is built using the `angular-strap` module.
If follows almost the same semantics from 
[Bootstrap navbar](http://twitter.github.io/bootstrap/components.html#navbar)
but it requires to use the directive `bs-navbar`
and it enables the directive `data-match-route` to activate
sections of the navigation bar automatically based on the current content
(angular-strap docs [here](http://mgcrea.github.io/angular-strap/#/navbar)).

    :::html
	&lt;!-- Navigation bar based in angular-strap bs-navbar directive -->
    &lt;div class="navbar navbar-fixed-top" bs-navbar>
    ...
      &lt;!-- data-match-route is used to active elements by current route -->
      &ltli data-match-route="/?">&lt;a href="#/">Home&lt;/a>&lt;/li>
      &lt;li data-match-route="/apps">&lt;a href="#/apps">Apps&lt;/a>&lt;/li>
      ...
	



