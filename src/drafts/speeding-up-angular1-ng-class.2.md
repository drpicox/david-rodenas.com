---
title: "Speeding up Angular1 ng-class"
tags:
  - angular
  - performance
  - contribution
  - benchpress
date: 2016-10-14
abstract: >
    NgClass usage has often a great impact in Angular 1 
    applications performance. 
    Here I present some basic optimizations and later 
    I present a pull-request that applies this optimizations automatically.    
snippet: |
    ```html
    <td ng-class="todo.completed && 'completed'">...</td>
    <panel ng-class="{success: !!$ctrl.todos, danger: !$ctrl.todos}">...</panel>
    ```
---

NgClass has a great impact on Angular1 applications:
it often used many times,
and it has a great impact on the digest loop.

Greater impacts of NgClass are when:
NgRepeat encloses NgClass directives
or when the NgClass condition uses a large object.


Speedup inside NgRepeat
-----------------------

NgRepeat multiplies the effect of any overhead
by the number of elements that are in 
the repeated collection.

### The problem

The more easy and recommended way 
to read and understand NgClass notation is using an object:

```html
<!-- easy to read and maintain, not very efficient -->
<td ng-class="{completed: todo.completed}">...</td>
```

In this case, the expression parsed is
`{completed: todo.completed}`, if
_todo.completed_ is _true_,
angular executes the expression as:
`{completed: true}`.

Angular copies this resultant object and saves it in the digest loop. 

For each digest loop, angular will execute the
expression and construct a new object
(usually the same)
but angular will need to compare the resultant
object with the saved one.

But this notation has a hindrance:
object construction and comparison is very expensive.  


### The solution

The solution is to use one little bit 
more obscure expression but that have a string
as a result:

```html
<!-- difficult to read and maintain, but very efficient -->
<td ng-class="todo.completed && 'completed'">...</td>
```

In this case Angular executes the expression
which result is either `'completed'`
if _todo.completed_ is _true_ or `false`
if it is _false_.

Angular copies this plain value.

For each following digest loop, angular will
execute the expression and get a plain value.
Now it just have to compare two plain values
which is fast.


### Speed improvement

After execute some benchpress benchmarks 
we have seen that object notation is about
10 times slower than string notation.  






Be a pro: <br>Replicate benchmarks in your browser
----------------------------------------------

Claims in performance gains here presented are 
evaluated with benchpress.

You can replicate the experiments that I have built with
the benchpress benchmark inside AngularJS git repo
[bootstrap-compile-bp](https://github.com/drpicox/angular.js/tree/4bde7677b705b7cc380bb92dcf57ba411cecdd6e/benchmarks) 
to replicate the experiment. 


More information
----------------

You can consult the official documentation [here](https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives)
to learn more details.
