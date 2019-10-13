---
title: "Angular1 Performance: ngClass and large objects"
tags:
  - angularjs-ngclass-performance
  - contributions
  - angularjs
  - performance
  - benchpress
  - ngClass
  - $watch
date: 2016-10-17
description: >
    Some times the performance of Angular1 applications
    suddenly drops. 
    Many times it is due to ngClass,
    or while using scope: '=' in our directives.
    Here I present a simple optimization
    that ensures the best performance.
snippet: |
    ```html
    <i class="icon" ng-class="{friendly: user.friends, male: user.isMale}">...</i>
    <i class="icon" ng-class="{friendly: !!user.friends, male: user.isMale}">...</i>
    ```
---

* This is replaced by the {ToC}
{:toc}

What is $watch?
---------------

Angular updates views by observing models and expressions
through _$watch_:

```javascript
$scope.$watch(whatToWatch, function onChange(newValue, oldValue) {
  // react to the change
}, objectEquality);
```

$watch parameters are the followings:

- **whatToWatch**: $watch will track changes in this expression,
- **onChange**: angular execute this function each time that the value changes,
- **objectEquality**: it describes which change will trigger onChange. 

_ObjectEquality_ holds the performance key. 
It only has two valid values: _true_ or _false_.


### $watch(expr, onChange, false)

The algorithm is the following:

```javascript
var oldValue;
function onDigest() {
  var newValue = expr;
  if (newValue !== oldValue) {    // compare new and old
    onChange(newValue, oldValue);
    oldValue = newValue;          // save new value
  }
}
```

It is the fastest $watch.
It is because the comparison 
(compare new and old) is the not-equal operator,
and copy (save new value) is an assignation.

But it have a risk: if the value is an object or an array
it calls onChange only when the object or array is replaced.
It ignores changes in fields or element changes.


### $watch(expr, onChange, true)

The algorithm is the following: 

```javascript
var oldValue;
function onDigest() {
  var newValue = expr;
  if (!angular.equals(newValue, oldValue)) {    // compare new and old
    onChange(newValue, oldValue);
    oldValue = angular.copy(newValue);          // save new value
  }
}
```

It is the slowest $watch.
It uses _angular.equals_ for the comparison,
and _angular.copy_ to save the value.
But it detects all changes, 
including changes in object fields or array elements.


## Complex objects and $watch...true

Let's imagine an object as the following:

```javascript
var david = {
  name: 'David Rodenas',
  friends: [jairo, janton, moraleda, natalia, sarek, victor],
};
```

This object contains friends field. 
This field is an array that contains other users.
Each user may have potentially other friends.


### Six degrees of separation

[Six degrees of separation](https://en.wikipedia.org/wiki/Six_degrees_of_separation)
theory tell us that we can reach all our users just following friends relationships.

```nomnoml
#direction: right

[<actor>you]
[you] - [<actor>friend1]
[you] - [<actor>friend2]
[you] - [<actor>friend ...]
[you] - [<actor>friend4]
[friend2] - [<actor>friendof1]
[friend2] - [<actor>friendof2]
[friend2] - [<actor>fof ...]
[friend2] - [<actor>friendofn]
[friendofn] - [<actor>friendofof1]
[friendofn] - [<actor>friendofof2]
[friendofn] - [<actor>fofof...]
[friendofn] - [<actor>friendofofn]
[friendofof1] - [<actor>friendofofof1]
[friendofof1] - [<actor>friendofofof2]
[friendofof1] - [<actor>fofofof ...]
[friendofof1] - [<actor>friendofofofn]
```

### Complex object copy

```javascript
var oldDavid = angular.copy(david);
```

It creates _oldDavid_ which is a copy of _david_
but also a copy of each of its friends, 
friends of friends, and all users in our domain. 

Thus, this copy is very expensive operation.


### Complex object equals

```javascript
var hasChanges = !angular.equals(david, oldDavid);
```

It compares each property of both, _oldDavid_ and _david_.
If a property is an array, it compares each element.
If elements are an object it compares once again value by value.
And so on.
It eventually will check that each user in our domain 
has the same name and friends.

This, this equals operations is very expensive.


### Other complex objects

There are lots of other objects that are complex. 

Library example:

```javascript
var davidUser = {
  name: 'David Rodenas',
  loans: [
    {book: theGoodParts, expires: '2016/11/12'},
    {book: aDeepnessInTheSky, expires: '2016/10/21'}
  ]
};
var cleanCodeBook = {
  name: 'Clean Code',
  author: 'Robert Cecil Martin',
  history: [
    {user: oriol, date: '2015/06/08'},
    {user: lluis, date: '2015/09/24'},
    {user: david, date: '2016/02/12'},
    {user: granados, date: '2016/04/01'}
  ]
};
```

Here are not friends, but a user has books, books has more users, etc. 
It will potentially copy all objects in our domain.


## Ids instead of references

Replacing object references by ids
can make objects less complex.


### Friends example

```javascript
var david = {
  id: '#david',
  name: 'David Rodenas',
  friends: ['#jairo', '#janton', '#moraleda', '#natalia', '#sarek', '#victor'],
};
```

### Library example

```javascript
var davidUser = {
  id: '#david',
  name: 'David Rodenas',
  loans: [
    {book: '#theGoodParts', expires: '2016/11/12'},
    {book: '#aDeepnessInTheSky', expires: '2016/10/21'}
  ]
};
var cleanCodeBook = {
  id: '#cleanCode',
  name: 'Clean Code',
  author: 'Robert Cecil Martin',
  history: [
    {user: '#oriol', date: '2015/06/08'},
    {user: '#lluis', date: '2015/09/24'},
    {user: '#david', date: '2016/02/12'},
    {user: '#granados', date: '2016/04/01'}
  ]
};
```

### Copy and equals

There are no direct references to other objects when using ids.

Given friends example, _angular.copy_ create another object, with 
fields _id_, _name_ with the same value, and a field _friends_
with a copy of the array with the same values.

_angular.equals_ check that both objects have the same fields,
_id_ and _name_ has the same values, and field _friends_ 
has the same values in the same order in both objects.


## Accelerate ngClass

ngClass uses _$watch-true_.
It need to track changes inside an object.

### Problem

Given the example:

```javascript
<i class="icon" ng-class="{friendly: user.friends}">...</i>
```

ngClass watches the expression:

```javascript
  {friendly: user.friends}
```

It copies and compares all user friends, 
friend of friends, ... which is really expensive.


### What we want

What we really meant to write was:

```javascript
<i class="icon" ng-class="{friendly: user.hasFriends()}">...</i>
```

In such case _ngClass_ would see one of the two following values:

```javascript
var caseAddClass = {friendly: true};
var caseRemoveClass = {friendly: false};
```

There is no trace of the user object.
It will not copy neither compare user values, friends, ...
No need to replace references by ids.


### Double negation notation

It is not always feasible to add new methods or properties
like _user.hasFriends_.

In such cases we can use double negation `!!` to a 
_truthy_/_falsy_ value into a _true_/_false_.

```javascript
<i class="icon" ng-class="{friendly: !!user.friends}">...</i>
```

_ngClass_ see one of the following values:

```javascript
var caseAddClass = {friendly: true};
var caseRemoveClass = {friendly: false};
```

Thus, no complex object copy or comparison.


## Comparison

### Implementation oportunity

Use ids instead of references is not always possible.
There are cases where an object will contain its own entities.
For example: a todo list may contain its todo objects.

Double negation notation is always possible to use.


### Implementation cost

Using ids instead of references ensures that
$watch will never do a large copy or comparison.
But it may need a deep refactor of the application.
It makes it one of the most difficult possible solutions.

Double negation notation is simple, 
just look for ngClass directives and add a double
negation operator before each object.


### Programmer reliability

Using ids instead of references will always work.
Programmer has to do nothing but use it.
It ensures that in any case accidentally the programmer
will make $watch to copy and compare all domain objects. 

Using double negation notation is dangerous.
A programmer may forget use it inside a ngClass,
work well the first day, and later, some day
discover that the app starts to behave sluggish.


### Performance

|                      | Digest-loop time |
| -------------------- | ---------------: |
| No double negation   |          1.40ms  |
| With double negation |          0.02ms  |


Time without double negation varies:
how big is the basic object? 
how many references it has?
how many references have your domain?
In some cases I have seen it take more 
than 30 seconds.

Double negation notation execution time is constant.
It does not matter how big the object is, 
how complex is our domain, it always will
take the same time.



## Conclusion

It is not always possible use ids instead of references.
But even using ids instead of references it copies
the object and compares it. 
If the object is complex the performance will suffer.
It does not give any guarantee of good performance. 

Double negation notation is simple, 
always have a predictable behaviour and good performance.
The only problem is the programmer, 
he may omit some double negation and performance will
suffer.
But it has a simple solution: 
time to time, or if performance degrades, 
look for all ngClass and check double negations, 
if any is missing, just add it.



Replicate benchmarks
--------------------

Performance times are obtained using benchpress.

You can replicate the experiments with
the benchpress benchmark inside AngularJS git repo
[ng-class-bp](https://github.com/drpicox/angular.js/tree/11d94ab6531c9aca6383f6eb8f23d182ea003d75/benchmarks) . 



More information
----------------

You can consult the official documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.

- $compile: https://docs.angularjs.org/api/ng/service/$compile
- $watch: https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
