---
title: Javascript
image: 
  width: 200
  height: 200
  src: /assets/images/javascript.png
description: >
  Javascript is the current
  standard of programming,
  it is presented in almost any
  device and capable to build
  almost any application.

tags:
  - apps
  - javascript
---
Javascript was created in the 1995 
under the appearance of an
object oriented language like
Java. 
Because of this, Javascript
was misunderstood for a long
time, and it gained a very
poor reputation.
But the real thing is that
Javascript is **not** and object
oriented language, and, may 
it look like Java, but is
rather a functional language
like 
[Lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language\)).

To really understand what happened
to Javascript and how I learn what
it actually is, I suggest to read
the page of the Chuck Norris of 
Javascript: 
[Douglas Crockford](http://javascript.crockford.com/javascript.html).

## Javascript foundation

Javascript is based in two programming languages:
[Self](https://en.wikipedia.org/wiki/Self_(programming_language\))
and
[Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language\)).

From Self Javascript inherits the 
object-oriented philosophy.
While most of object-oriented
languages are based in classes,
there are not classes in Javascript.
Instead of this it uses prototypes:

```javascript
penguin = {
  say: function() { return this.name + " eat fish"; }
  };
kowalski = { name: "Kowalski" };
kowalski.__proto__ = penguin; /* caution: this is a simplification */
/* now you can use everything from penguin */
kowalski.say();
```
	
In this example `penguin` acts as prototype for the
`kowalski` object, but, unlike traditional object
oriented languages, it is also an object. 
So, in some way speaking, we can say that Javascript 
is *instance-oriented* rather than *class-oriented*.
(Note: `__proto__` is not standard yet, 
officially it is intended to use `prototype` in the constructor,
but it 
[is supported](https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/Object/proto)
by most of the Javascript
engines).

From Scheme Javascript inherits the
functional approach. 
Every function in Javascript is
a value, like any other type:

```javascript
private = function() { return "I'm cute"; }
/* now you can use it */
private();
```

In addition it implements variable closures:
functions defined inside functions can 
access to its parents variables (yes yes,
functions inside functions!):

```javascript
function rico() {
	var stomach = ["bomb","doll","fish"];
	return function(item) {
	   return stomach[item];
	}
}
regurgitate = rico();
/* now we can call to the function and obtain things inside */
regurgitate(1);
```
	
Cool, isn't it? 
Although you think that you can do it with C language,
please, try not. 
It may work, but probably you will break your program
sooner o later.
But this is not as strange at it seems,
nowadays I started to programming java using the same
philosophy, one example is:

```java
/* The same example in java */
import org.apache.commons.functor.*;
import org.apache.commons.lang3.mutable.*;

public static void main(String[]) {
  Function<UnaryFunction<Integer,String>> rico = new Function<UnaryFunction<Integer,String>>() {
      @override
      public UnaryFunction<Integer,String> evaluate() {
	    final MutableObject<String[]> stomach = new MutableObject(new String[] {"bomb","doll","fish"});
		return new UnaryFunction<Integer,String>() {
		  @override
		  public String evaluate(Integer item) {
		    return stomach.getValue()[item];
		  }
		};
      }
	};
  UnaryFunction<Integer,String> regurgitate = rico.evaluate();
  /* now we can call to the function and obtain things inside */
  System.out.println(regurgitate.item(1));
}
```

Note: I have used `MutableObject` just for *keep in mind* 
purposes, but in **this** example is not actually necessary.

	
## Playing and learning

To test and learn Javascript my best tip is to use Chrome console.
Just click right button, inspect element, and look for the
console. 
Here you can write any Javascript expression direcly. Try:

```javascript
alert("I'm here!");
```
