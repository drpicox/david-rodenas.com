---
title: Pure HTML templates
tags: 
  - angular
  - html
  - templates
  - teaching
description: >
  Angular has its own sugar syntax for building
  html templates, like #reference, (event), 
  and [property]. They are not pure html, but 
  they can be replaced by pure html.
  Here is a complete example.
snippet: |
  ```html
  <my-toggle #toggle></my-toggle>
  <my-toggle ref-toggle></my-toggle>
  ```
website: https://angular.io/docs/ts/latest/guide/template-syntax.html
---

Given this template:

```html
<my-toggle #toggle></my-toggle>
<button (click)="toggle.toggle()">Toggle</button>
<input type="checkbox" [(ngModel)]="toggle.opened">
<h1 *ngIf="toggle.isOpen()">Extra information</h1>
```

it can be replaced with this pure html template that has the same meaning:

```html
<my-toggle ref-toggle></my-toggle>
<button on-click="toggle.toggle()">Toggle</button>
<input type="checkbox" bindon-ngModel="toggle.opened">
<template bind-ngIf="toggle.isOpen()">
  <h1>Extra information</h1>
</template>
```

Although #sharp, (parenthesis), [brackets] and *star are very handy, 
they are not supported by many applications. If this is the case,
you can replace them with pure html expressions.

The comparison table is:

|Sugar Syntax|Html Syntax|
|-|-|
| #symbol | ref-symbol |
| [prop]="expr" | bind-prop="expr" |
| (event)="action" | on-event="action" |
| [(model)]="expr" | bindon-model="expr" |
| *str="expr" | <template [str]="expr"> |
