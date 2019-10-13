---
title: "Update package.json dependencies versions"
tags:
  - teaching
  - npm
  - node
  - package
  - dependencies
  - version
  - update
  - security
date: 2016-09-04
description: >
    Usually the package.json dependencies count is large
    and many times their dependencies become old.
    Use npm-check-updates to update them.
snippet: |
    ```bash
    $ npm install -g npm-check-updates
    $ ncu -u
    ```
---

## Overview

Keep dependencies up to date is a very good practice:
you have less bugs and [better security](https://www.owasp.org/index.php/OWASP_Dependency_Check).

The problem is that the number of dependencies is large
and check updates one by one is a time consuming task.

## `npm-check-dependencies`

It is a node utility that you run in the same
directory that you have your `package.json`
and it checks for all updates available for you packages.

## How to use it

Install the tool if you do not have installed it before:

```bash
$ npm install -g npm-check-updates
```

Go to the directory with the `package.json` of your project
and run the utility:

```bash
$ ncu
⸨░░░░░░░░░░░░░░░░░░⸩ ⠏ :
 aliasify                    ^1.9.0  →   ^2.0.0 
 browserify-ngannotate       ^1.0.1  →   ^2.0.0 
 grunt                       ^0.4.5  →   ^1.0.1 
 grunt-browserify            ^4.0.1  →   ^5.0.0 
 grunt-contrib-clean         ^0.6.0  →   ^1.0.0 
 grunt-contrib-concat        ^0.5.1  →   ^1.0.1 
 grunt-contrib-connect      ^0.11.2  →   ^1.0.2 
 grunt-contrib-copy          ^0.8.2  →   ^1.0.0 
 grunt-contrib-cssmin       ^0.14.0  →   ^1.0.2 
 grunt-contrib-uglify       ^0.10.0  →   ^2.0.0 
 grunt-contrib-watch         ^0.6.1  →   ^1.0.0 
 grunt-karma                ^0.12.1  →   ^2.0.0 
 jit-grunt                   ^0.9.1  →  ^0.10.0 
 karma                     ^0.13.15  →   ^1.2.0 
 karma-chrome-launcher       ^0.2.1  →   ^2.0.0 
 karma-jasmine               ^0.3.6  →   ^1.0.2 
 karma-phantomjs-launcher    ^0.2.1  →   ^1.0.2 
 phantomjs                  ^1.9.18  →   ^2.1.7 
 stringify                   ^3.1.0  →   ^5.1.0 

The following dependencies are satisfied by their declared version range, but the installed versions are behind. You can install the latest versions without modifying your package file by using npm update. If you want to update the dependencies in your package file anyway, use ncu -a/--upgradeAll.

 grunt-contrib-less        ^1.0.1  →  ^1.4.0 
 grunt-sass                ^1.1.0  →  ^1.2.1 
 jasmine-core              ^2.4.1  →  ^2.5.0 
 karma-source-map-support  ^1.1.0  →  ^1.2.0 

Run ncu with -u to upgrade package.json
```

Upgrade your dependencies:

```bash
$ ncu -a -u
...

Upgraded /Users/drodenas/Projects/drpicox/angular1-scaffold/package.json

$ npm install
```

## Warning: better with _git_

Before commit just check if everything works as expected.
Some times it is possible that an update break your code.

If you do not have _git_ or equivalent _vcs_, 
make a copy before execute it, 
or keep track of the changes. 


## More information

See:
- https://www.npmjs.com/package/npm-check-updates
