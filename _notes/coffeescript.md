---
title: Coffeescript
image: 
  width: 49
  height: 40
  src: /assets/images/coffeescript.png
url: http://coffeescript.org/
source: https://github.com/jashkenas/coffee-script/
tags:
  - apps
  - web
  - mobile
  - server
  - javascript
description: >
  Coffeescript is a Javascript *dialect* 
  designed to ease Javascript programming.

---
Coffeescript can be considered as a feasible Javascript replacement
for any environment.
Although Coffescript is different to Javascript,
it has a translator that transforms any Coffeescript into a Javascript,
so it can be used in any place that have Javascript
(web, mobile, server, ...)
In addition it has the same functionalities (including libraries),
and also adds some utilities to object oriented programming.


```coffeescript
helloer = (name) ->
  capitalize = (string) ->
    string.charAt(0).toUpperCase() + string.slice(1)
  name = capitalize name
  () -> console.log "Hello #{name}"

hello = helloer "World"
hello()
```
