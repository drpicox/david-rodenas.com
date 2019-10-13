---
title: Template Reference Variables
tags: 
  - angular
  - teaching
description: >
  Angular allows to have named elements
  that can be referenced inside their own templates.
  They are very useful but some times
  the logic can be a little obscure.
snippet: |
  ```html
  <my-toggle #toggle></my-toggle>
  <button (click)="toggle.toggle()">Toggle</button>
  <h1 *ngIf="toggle.isOpen()">Extra information</h1>
  ```
example: https://embed.plnkr.co/FVRCLo/
website: https://angular.io/docs/ts/latest/guide/template-syntax.html#!#ref-vars
---

* replace by toc
{:toc}

## Overview

Although it is correct to say that template reference variables
can be referenced inside their own templates, 
implications are not always easy to understand.

## Multiple templates

Just there is one thing to remember: 
each time that there is a star `*` or a template directive
it defines a new template, so 
there are two templates in the following example:

```html
Main template
<div *ngIf="true">
  Internal ngIf children template.
</div>
```

This still true even if we assign it into a component:

```javascript
@Component({
    template: `
        Component template
        <div *ngIf="true">
        Internal ngIf children template.
        </div>
        `
})
```

For AngularJs 1 programmers it becomes natural, 
but they called them scopes.

## Ref variables scopes rules

### Rule 1: Outer visible

Outer variables are always visible by its children templates.

```html
<div #mostOuter>Most Outer</div>
I can use mostOuter: {% raw %}{{mostOuter.textContent}}{% endraw %}<br>
<div *ngIf="true">
    <div #outer>Outer</div>
    I can use outer: {% raw %}{{outer.textContent}}{% endraw %}<br>
    I can use mostOuter: {% raw %}{{mostOuter.textContent}}{% endraw %}<br>
    <div *ngIf="true">
        <div #outer>Inner</div>
        I can use inner: {% raw %}{{inner.textContent}}{% endraw %}<br>
        I can use outer: {% raw %}{{outer.textContent}}{% endraw %}<br>
        I can use mostOuter: {% raw %}{{mostOuter.textContent}}{% endraw %}<br>
    </div>
</div>
```

### Rule 2: Inner invisible

Inner variables are not visible by its parent templates.

```html
<div *ngIf="true">
    <div #inner>inner</div>
    I can use inner: {% raw %}{{inner.textContent}}{% endraw %}<br>
</div>
I cannot use inner: {% raw %}{{inner?.textContent | json}}{% endraw %}<br>
```

### Rule 3: Non-Inner uniqueness

Inner variables name can be replicated or used inside ngFor.

```html
<div *ngFor="i of [1,2,3]">
    <div #inner>{% raw %}{{i}}{% endraw %}</div>
    Here inner text is "{% raw %}{{i}}{% endraw %}": {% raw %{{inner.textContent}}{% endraw %<br>
</div>
<div *ngIf="true">
    <div #inner>inner</div>
    Here inner text is "inner": {% raw %}{{inner.textContent}}{% endraw %}<br>
</div>
I cannot use inner: {% raw %}{{inner?.textContent | json}}{% endraw %}<br>
```

### Rule 4: Not visible from Controller

```javascript
@Component({
    selector: 'an-example',
    template: `
        <span #foo>bar</span>
        ctrlFoo: {% raw %}{{ getFoo() }}{% endraw %}, is empty
        `
})
class AnExample {
    getFoo() {
        return this.foo;
    }
}
```


### Rule 5: Should not

Outer vars can be shadowed, but they should not.
Inner vars can be declared more than once, but they should not.

## Example

There is a full example in plnkr. 
Just try it.
