---
title: "AngularJS for Designers"
source: https://github.com/drpicox/tutorial-angulardesigners-v1
tags:
  - teaching
  - angularjs
  - ui
  - ux
  - howto
date: 2014-11-28
description: >
    Small demo tutorial oriented
    for ui-designers and ux-experts
    to allow them to do quickly layouts
    using angular.
snippet: |
    ```html
    <h3>Demo of a toggle</h3>
    <div ng-controller="Toggle as burger">
        <button ng-click="burger.toggle()">Show/Hide</button>
        <div ng-show="burger.isVisible()">
            This is the content <br>
            of the toggle.
        </div>
    </div>
    ```
---

## Motivation

Website designers and layout building does not have the same
maintenance requirements than applications and they should be
easy to construct and manipulate.

Many times I have found very large templates to work with,
some times even with thousands of lines. 
They are difficult to manipulate, understand, and keep synced
with code base.

Because of this I created a small tutorial, presented to some
of my customers, describing how to use Angular to create quickly
layouts but at the same time, interactive and easy to maintain.

## What you learn?

It shows how to:

- **Create and reuse templates**. 
  There is no need to use other tools like
  php/assemble/... to create layouts.
  It shows how to use `ngInclude` to 
  include templates inside other templates.

- **How to add dummy data**.
  Usually templates have list and data that it 
  should be retrieved from services.
  Here shows how to use angular `ngRepeat` to 
  create lists, `ngController` te get data,
  and `{% raw %}{{ variable }}{% endraw %}` expressions.

- **How to add toggles and accordions**.
  It gives the code for an accordion and a toggle
  and shows how to use it.


## How to start

### Download the project

Download or clone the project. Ex:

```bash
git clone https://github.com/drpicox/tutorial-angulardesigners-v1.git
```

### Install and run a webserver

If you have already a webserver move this 
project to your webserver and open the web.

If you do not have a webserver, or you want 
a webserver that opens in any directory from command
line you can follow the next steps.

Install node js:

- [http://nodejs.org/](http://nodejs.org/){:target="_blank"}

Install the _http-server_ (Windows):

```shell
C:\> npm install -g http-server 
```

MAC/Linux:

```bash
$ sudo npm install -g http-server
```

Run the http-server in your directory:

```bash
cd tutorial-angulardesigners-v1
http-server -c-1 . -p 4001
```

Note that `-c-1` disables browser cache, which makes development easier, 
and you can change the port to serve multiple directories and make 
comparisons.
