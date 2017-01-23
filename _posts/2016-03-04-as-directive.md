---
title: "My proposal for as Directive"
tags:
  - as-directive
  - angularjs
  - contributions
date: 2016-03-04
description: >
    Large part of the effort of building Angular applications
    is to connect components.
    Using bindings we can pass arguments, trigger updates,
    watch changes. Using require we can connect to other 
    parent or sibiling controllers and use them directly.
    But what happen when we want to connect to children controllers?
    How we can do it?
    What do we obtain?
snippet: |
    ```html
    <toggle as="myToggle"></toggle>
    <button ng-click="myToggle.toggle();">Toggle</button>
    <p ng-show="myToggle.isOpened()">The toggle is active</p>
    ```
source: https://github.com/angular/angular.js/pull/14080
---

A new proposal: **asDirective**
-------------------------------

See https://github.com/angular/angular.js/pull/14080
for details, current status of the proposal, and feel free to comment.

Here I propose a new Directive: the `asDirective`. 
This directive publishes the current controller into the scope.
It is close to Angular2 # which creates a new variable inside the template.

```html
<toggle #myToggle></toggle>
<button (click)="myToggle.toggle()">Toggle</button>
<p [hidden]="!myToggle.isOpened()">The toggle is active</p>
```

With the `asDirective` in Angular1 it would look like:

```html
<toggle as="myToggle"></toggle>
<button ng-click="myToggle.toggle()">Toggle</button>
<p ng-show="myToggle.isOpened()">The toggle is active</p>
```

You just have to look to Angular2 examples to find lots of situations in which this directive is useful.


## Deprecating **ngController** Directive

Since first versions of Angular, ngController is used to attach 
controllers directly to a template (for example for landing pages)
and since v1.1 it has the as option that allows name it and bind
it with a known name without polluting scope:

```html
<!-- avoid -->
<section ng-controller="BooksListController as books">
    <book-item book="book" ng-repeat="book in books.list index by book.id"></book-item>
</section>
```

But what happen when we want to add parameters to that controller,
for example:

```html
<!-- avoid -->
<section ng-controller="BooksListController as books" category="'sci-fi'">
    <book-item book="book" ng-repeat="book in books.list index by book.id"></book-item>
</section>
```

There are two solution:

1. Inject into `BooksListController` `$attrs` and `$parse` to get the category.

2. Take advantage of Angular directives and define `category` as a binding:

```html
<!-- avoid -->
<static-books-list category="'sci-fi'">
    <book-item book="book" ng-repeat="book in staticBooksListCtrl.list index by book.id"></book-item>
</static-books-list>
```

This second case has two problems: 
- programmer must remember the name which what the controller is published
- programmer cannot take advantage of transclussion or the new components, scopes hide the visibility

So, ¿what is the proposed solution? Use `asDirective`:

```html
<!-- recommended -->
<static-books-list category="'sci-fi'" as="books">
    <book-item book="book" ng-repeat="book in books.list index by book.id"></book-item>
</static-books-list>
```


## Transclussion and **asDirective**

Yes! Transclussion! This word unknown for most of Angular programmers but one
of the most powerful features: pass a template as an argument!

¿What happens if we need to access to the transcluding component controller?
We can use `asDirective` to control it.

```html
<pager elements="books in booksList" as="pager">
  <pager-element>{{book.name}}</pager-element>
  <pager-footer><button ng-click="pager.next()">Next</button></pager-footer>
</pager>
```


