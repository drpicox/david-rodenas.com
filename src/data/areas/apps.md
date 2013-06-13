---
icon: code
title: Quick Apps
abstract: >
  I can help you to build 
  awesome apps in almost no time.
  I use web technologies 
  <!--  ([html5](#/projects?search=tag:html5),
     [css](#/projects?serach=tag:css) and
     [javascript](#/projects?search=tag:javascript)) -->
  (html5, css and javascript),
  they are wide-spread and available in any device.
  You can hire your favourite designer to
  create excellent look and feels 
  and I will add the logic with Javascript.
  You can use it for your web apps,
  but also for mobile apps.
  It will work on iPhone, Android, tablets, ...
  That is just for the user view,
  for the server you can use
  Java, PHP, Node and Ruby, 
  or I can adapt to any other.
  My quickest application stacks are build
  with fat Javascript in the client side,
  Ruby+DataMapper in the server side,
  and a REST communication protocol, 
  so you can change any layer at any time.
next:
  url: "#/data"
  text: Using with smart data
resources:
  - data-mapper
  - ruby
  - sinatra
  - angularjs
  - gruntjs
tags:
  - apps
---
## Overview

I'm taking advantage of all the 
recent advances in web development
and the ubiquity of Javascipt
to make apps quickly.

I'm also using scalable 
applications arquitectures
and software components
to make sure that my developments
will grow with the needs of your
organization 
and will merge and combine with other
technologies.

<!-- > Javascript is eating the work ([more](http://news.dice.com/2013/05/16/javascript-is-eating-the-world/))
-->
## Fast implementations

### Fast prototypes

Using 
<resource-link basename="data-mapper"></resource-link>
as data backed
with
Ruby <resource-link basename="sinatra"></resource-link>
as a 
<resource-link basename="rest"></resource-link>
server
and 
<resource-link basename="angularjs"></resource-link>
as application framework
I can build full-stack applications in just one week or so.

### Mobile apps

Most of resulting applications can run directly 
on top of mobile phones as nativa apps just
using a 
[cache.manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5).

If more complex apps are required 
I will use 
[PhoneGap](https://build.phonegap.com/),
or some other options.
You will get an app that works for iPhone and Android.

## Three-tier architecture

Currently I'm using a [three-tier architecture](http://en.wikipedia.org/wiki/Multitier_architecture#Three-tier_architecture):
a storage tier, a server tier, and an user application tier.

### Storage tier


I'm currently building the storage tier with 
<resource-link basename="data-mapper"></resource-link>.
It makes a quick glue between server side code and
a database. 
I use it because it is really simple: 
no SQL is required, 
database schema is automatically updated,
transparent mapping with code,
no dependency to a server provider,
no configuration files,
...
It is like a Hibernate 
but it works like magic
(of course, no magic involved).

When I build server sides with Java
I usually use my own abstraction layer and 
[JDBC](http://en.wikipedia.org/wiki/Java_Database_Connectivity).
My abstraction layer is inspired in 
[mongoDB](http://www.mongodb.org/) and
Javascript (using 
[Apache Commons](http://commons.apache.org/))
which ensures a safe access to the database
and 100% control of all connections and resources
(it ensures that it will release always all
resources).


### Server tier

I'm heavely using 
<resource-link basename="rest"></resource-link>
protocol for servers. 
It is a standard protocol based in
the HTTP protocol 
(the protocol used to load pages in your web browser)
able to deliver content to applications.
The content sent and received by most of my
applications is
<resource-link basename="json"></resource-link>,
a <em>discovered standard</em> based in
Javascript designed to take place to
XML in most of the communications.

My current server implementations 
in Ruby are built using 
<resource-link basename="sinatra"></resource-link>,
it is a very simple library that allows to
build REST servers in no time.
In the case of Java I really encourage to use
<resource-link basename="spark-java"></resource-link>,
it is a framework that imitates Sinatra
and releases the programmer of using complex
configuration files.
I really preffer to use Ruby when it is possible,
it is quicker building apps, 
but I use Java for some projects where 
computational time is critical (like in
[Eltanin](#/projects/eltanin)).

### Aplication tier

This is the most complex tier.
It has lots of possibilities and lots of alternatives,
some are more straightforward and some are more limited.
Applications can run in desktops, browsers, mobile phones,
or tablets. 
My current approach is the following:
responsive HTML5, css, and Javascript.
In the case of mobiles, there are wrappers
that encapsulates a web-app into a
mobile-app. 
Using css the appearence can be adapted to any device
(iOS or Android), and performance is really close
(probably you are using one of [them](http://phonegap.com/app/)).

<resource-link basename="javascript"></resource-link>
is an old new languaje. 
It was created in the 1995 but the most
amazing applications and libraries 
have been recently arrived.
In my current applications I use
a mix of many technologies:

- <resource-link basename="angularjs"></resource-link>,
a modular MVVC library that allows to create
components and reuse them like magic
(of course, no magic involved),
- [Bootstrap](http://twitter.github.io/bootstrap/) or
[Foundation](http://foundation.zurb.com/) 
as a responsive layouts 
(adapts to mobile and to desktop automatically)
to build the html5 interfaces,
- and <resource-link basename="gruntjs"></resource-link>,
the <em>Makefile</em> for building webs, it 
combines multiple technologies to build and compress
websites ready to deploy in one single command.
