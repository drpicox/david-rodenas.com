---
title: JSON
image_width: 160
image_height: 160
image: /assets/images/json.png
url: http://json.org/
description: >
  JSON is a data-interchange format.
  It is a replacement for XML in many
  environments and integrates easily
  with Javascript.

tags:
  - apps
  - rest
  - server
  - document
  
---
I like to say that 
[JSON](http://json.org) 
was not invented,
it was discovered. 
The reason is because JSON
is just a subset of Javascript,
in other words: it is Javascript.

## Definition

JSON was <em>discovered</em>
in [2006](http://tools.ietf.org/html/rfc4627)
by 
[Douglas Crockford](http://crockford.com/)
(as I say, the Chuck Norris of Javascript).
It textually describes a data structure using 
parts of Javascript.

Any JSON data represents an object or a
arrays. Each of them can contain values, 
those values can be numbers, strings, 
booleans, null, or even other objects or arrays.

Basic data types of JSON are:

```javascript
    /* object */
    { "name": "NYC Zoo", "open": true }
	/* list */
	[ "NYC Zoo", "Hokoban" ]
	/* string */
	"Kowalski"
	/* numbers */
	110.5
	/* booleans */
	true
	/* null value */
	null
```

Objects can contain arrays as value, and vice-versa.
Spaces and new lines are not significant if they
are outside of an string.

```json
{ "name": "NYC Zoo",
  "open": true,
  "animals": [
    { "name": "Skipper" },
    { "name": "Kowalski" },
    { "name": "Private" },
    { "name": "Rico" }
  ]
}
```

## Notes

JSON is a subset of Javascript, so,
not any valid Javascript value is a valid
JSON value.

Although Javascript allows to define strings
with characters `"` or `'`, JSON only considers
a string when the value starts with `"`. So,
you cannot use `'` as starting character for a 
string.

Javascript object property names can be
written directly just as follow:

```javascript
/* Javascript only */
{ name: "Kowalski" } 
```

in Javascript you can use optionally also
string notation for the property name
(very useful when property names has
spaces or other characters). In case
of JSON string notation is mandatory,
so you have to use always `"` in the 
property name.

```javascript
/* JSON and Javascript */
{ "name": "Kowalski" }
```

Another important thing is about what kind
of values are valid. Although inside an
object or an array, any value is valid,
only arrays an objects are valid as
whole JSON data:

```javascript
/* valid JSON data: object */
{ "open": true }
/* valid JSON data: array */
[ true ]
/* invalid JSON data: not object nor array */
true
```

## JSONP

[JSONP](http://en.wikipedia.org/wiki/JSONP)
is in fact a function call wrapping JSON data.

Browsers prohibits Javascript by default to get data from
other servers than the one origin of the current page.
This is done by this way because of security reasons.
Some time ago 
[mashups](http://en.wikipedia.org/wiki/Mashup_(web_application_hybrid\))
started to appear. 
They combined data from different sources (different origins).
To do it they *hacked* the limitation by loading
directly Javascript with the data from other sources.
It worked because the browser cannot forbid to load
resources from other origins, for example, you can use a 
[CDN](https://en.wikipedia.org/wiki/Content_delivery_network).
In that point JSONP came alive:

```javascript
/* standard JSON data 
   http://other.site/data.json */
[ true ]
/* JSONP wrapped data in a callback
   https://other.site/data.json?callback=mycallback */
mycallback([true]);
```
	
The idea of JSONP is to have your own function callback
that will get the data. In order to get the data
you add (many frameworks do it automatically) a script
tag to your web page:

```html
<script src="https://other.site/data.json?callback=mycallback"></script>
```

and when the browser gets the resource, it executes the 
script, and this script should call to your 
`mycallback` function.

This technique is a little risky
because you must trust to the source of the data:
they can introduce in the script any
kind of code that they want.

## JSON vs XML

JSON was *discovered* to replace XML.
The strong points are: it is lighter, 
it is faster, it is easier to read.
But the main difference is not this,
the main difference is that `JSON`
describes a data structure (such the
one that we may have in any program)
and `XML` describes a document.

`XML` is in fact a document, 
not a data structure,
for this reason it really does not
fits well in many structures and
some tricky or invalid data
can be easily written. 
`JSON` only allows to encode
data structures. An example
of a valid `XML` and impossible
`JSON` (you must find another
way to write the same thing) is:

```html
<!-- no direct translation to JSON -->
<data>
  This <verb>is</verb> an XML.
</data>
```

Anyway, both are textual data
transmission formats.




