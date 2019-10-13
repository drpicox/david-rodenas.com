---
title: "Angular1 Performance: ngClass inside ngRepeat"
tags:
  - angular1
  - performance
  - contributions
  - benchpress
  - ngClass
  - digest-loop
date: 2016-10-14
description: >
  I present a little trick that improves 
  digest loop performance 10 times 
  in our applications.
  It is very useful when we use 
  ngClass directives inside ngRepeat.
snippet: |
    ```html
    <td ng-class="{completed: todo.completed}">...</td>
    <td ng-class="todo.completed && 'completed'">...</td>
    ```
---


## _ngClass_ notations

In this post I consider two kinds of _ngClass_ notations:
object notation, and string notation.

### Object notation

```html
<td ng-class="{completed: todo.completed}">...</td>
```

_ngClass_ receives an object in which
each key is a css class and its value is a boolean condition,
if this condition is truthy _ngClass_ adds the 
css class to the element, and if it is falsy 
_ngClass_ removes it.

Object notation is the most common notation widely accepted.


### String notation

```html
<td ng-class="todo.completed && 'completed'">...</td>
```

_ngClass_ receives a string or a false value.
If the expression evaluates to a string
_ngClass_ adds the resultant css class.
If the expression evaluates false 
_ngClass_ does nothing or removes the css class added.

String notation is rarely used and it looks like a hack.


### How string notation works?

Javascript `&&` operator semantics is the following:

| Expression    | Result |
| ------------- | ------ |
| truthy && ANY | ANY    |
| falsy && ANY  | falsy  |


Given the previous example replacing 
_truthy_/_falsy_ by `todo.completed` and _ANY_ by `'completed'`
we get:  

| todo.completed && 'completed' | condition && 'completed' |
| ----------------------------- | ------------------------ |
| false && 'completed'          | false                    |
| true  && 'completed'          | 'completed'              |


Thus _ngClass_ using string notation 
receives either a _false_ or a `'completed'` string.


## Comparison

### Readability and maintainability

Object notation is simple to understand:
in one side you have the css class name and in the other the condition.
You can add or remove properties to the object easily.

String notation is more complex:
you need to understand javascript boolean evaluation insights.
If you need to specify only one class is easily readable
for those who know this notation, but if you need more
than one css class it becomes really complex.


### Performance

Digest-loop times of both notations are:

|                   | Object notation | String notation |
| ----------------- | --------------: | --------------: |
| Few ngClass       |       0.07ms    |        0.02ms   |
| Thousands ngClass |      12.50ms    |        0.75ms   |


Object notation is expensive:
_ngClass_ has to compare objects to know
if there are css class to add or remove.

String notation is faster:
_ngClass_ just need to process a plain value,
either a string or a _false_.


## Conclusion

If you have few _ngClass_ directives use object notation.
It is easier to read, to understand and to maintain.
Digest-loop times under 1ms are negligible.

If you have hundreds or thousands _ngClass_ directives
active at the same time
you should use string notation. 
Having a digest loop larger than 8ms are not recommended
because the user start to feel the application sluggish.
Using string notation is easy to keep digest-loop times
under 1ms.


Replicate benchmarks
--------------------

Performance times are obtained using benchpress.

You can replicate the experiments with
the benchpress benchmark inside AngularJS git repo
[ng-class-bp](https://github.com/drpicox/angular.js/tree/11d94ab6531c9aca6383f6eb8f23d182ea003d75/benchmarks) . 


## More information

- Digest loop: https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest
- Benchmark pull request: https://github.com/angular/angular.js/pull/15243
