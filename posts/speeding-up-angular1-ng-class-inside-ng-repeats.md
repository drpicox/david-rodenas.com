---
title: "Speeding up Angular1 ng-class inside ng-repeats"
tags:
  - angular
  - performance
  - contribution
  - benchpress
  - ng-class
date: 2016-10-14
abstract: >
    NgClass has a little overhead in each
    digest loop, but when it is inside an
    ngRepeat it multiplies the effects of the
    overhead.
    A little trick can improve up to 10 
    times the speed of the ngClass digest.
snippet: |
    ```html
    <td ng-class="{completed: todo.completed}">...</td>
    <td ng-class="todo.completed && 'completed'">...</td>
    ```
---

_NgClass_ has a great impact on Angular1 applications:
it often used many times,
and it has a great impact on the digest loop.

One of the greater impacts of _ngClass_ is
when an ngRepeat encloses _ngClass_ directives.

NgRepeat multiplies the effect of any overhead
by the number of elements that are in 
the repeated collection.


## The problem

The recommended way to use _ngClass_ is  
to read and understand _NgClass_ notation is using an object:

```html
<!-- easy to read and maintain, not very efficient -->
<td ng-class="{completed: todo.completed}">...</td>
```

In this case, the expression parsed is
`{completed: todo.completed}`.
If _todo.completed_ is _true_,
angular executes the expression as
`{completed: true}`,
if _todo.completed_ is _false_,
angular executes the expression as
`{completed: false}`.

Angular copies this resultant object and saves it in the digest loop. 

For each digest loop, angular will execute the
expression and construct a new object
but angular will need to compare the resultant
object with the saved one.

But this notation has a hindrance:
object construction and comparison is very expensive.  


## The solution

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
if _todo.completed_ is _false_.

Angular copies this plain value.

For each following digest loop, angular will
execute the expression and get a plain value.
Now it just have to compare two plain values
which is fast.


## Comparison

I have created a benchpress benchmark to compare
the performance of both solutions.

| digest loop time  | Object Notation | String Notation |
| ----------------- | --------------: | --------------: |
| Few ngClass       |       0.07ms    |        0.02ms   |
| Thousands ngClass |      12.50ms    |        1.20ms   |

Times of the DOM creation, class update, ...
are very similar. There is not a great difference
from using one notation to other.

Times of _$digest_ loop are really different:
object notation takes around 10 more times to execute
than string/boolean notation.
But, with few elements, that not matters which implementation
you use, both take far less than a millisecond to compute.
It is only important when there are thousand or more _ngClass_,
then, it can save tens of milliseconds.


## Conclusion

Having a digest loop larger than 8ms is not recommended:
user start to feel the app sluggish.
That means, if we know that we will have the order of thousands
_ngClass_ we need to use the _string notation_.

If we have just only few _ngClass_ directives, few tens,
may be hundreds, we do not need care, and we can use the 
_object notation_ which is easier to use and understand.


Be a pro: <br>Replicate benchmarks in your browser
----------------------------------------------

Claims in performance gains here presented are 
evaluated with benchpress.

You can replicate the experiments that I have built with
the benchpress benchmark inside AngularJS git repo
[bootstrap-compile-bp](https://github.com/drpicox/angular.js/tree/11d94ab6531c9aca6383f6eb8f23d182ea003d75/benchmarks) 
to replicate the experiment. 


