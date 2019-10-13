---
title: "drpx-components"
tags:
  - angularjs-extensions
  - view
  - projects
  - angularjs
  - component
  - bower
  - contributions
date: 2014-11-25
website: http://david-rodenas.com/drpx-components/
source: https://github.com/drpicox/drpx-components
description: >
    A collection of components for developing applications
    in AngularJS.
snippet: |
    ```html
    <div drpx-if-route="/?">
    This is present only when route is the root.
    </div>
    ```
---

## Overview 

This collection contains:

- An accordion

```html
<div ng-controller="DrpxAccordionController as accordion">
    A long time ago, in a galaxy far, far away....<br>

    <ul>
        <li>
            <div ng-click="accordion.toggle('part1')">
                Part 1
            </div>
            <p ng-show="accordion.is('part1')">
                It is a period of civil war. Rebel<br>
                spaceships, striking from a hidden<br>
                base, have won their first victory<br>
                against the evil Galactic Empire.<br>
            </p>
        </li>
        <li>
            <div ng-click="accordion.toggle('part2')">
                Part 2
            </div>
            <p ng-show="accordion.is('part2')">
                During the battle, rebel spies managed<br>
                to steal secret plans to the Empire's<br>
                ultimate weapon, the DEATH STAR, an<br>
                armored space station with enough<br>
                power to destroy an entire planet.<br>
            </p>
        </li>
    </ul>

    <div ng-click="accordion.hide()" ng-show="accordion.any()">
        Close accordion.
    </div>
</div>
```

- Conditional classes by route

```html
<div drpx-class-route="{'home-page' : '/?', 'a-product-page': '/products/[^/]+'">
    ...
</div>
```

- Click and drag scroll panels

```html
<div drpx-click-scroll style="overflow: auto;">
    A very long long text... or big image... or... anything that may not fit.
</div>
```

- Custom if directives support

```html
<element your-custom-if="some condition"></element>
```

- Conditional if route directive

```html 
<div drpx-if-route="/?">
    This is present only when route is the root.
</div>

<div drpx-if-route="/products">
    This is present only when route is /products.
</div>
```

- Any Html fully customizable drop-down selector

```html
<drpx-select-html ng-model="your.model" data-options="option in your.options">
  My <b>cool</b> option: {{option}}.
</drpx-select-html>
```

- A selector model

```javascript
this.selector = new DrpxSelector();
this.selector.add({
    id: 'colonial-one',
    label: 'Colonial One',
    value: 'Colonial One is a civilian starship that serves as the headquarters for the President of the Twelve Colonies.'
}, {
    id: 'galactica',
    label: 'Battlestar Galactica',
    value: 'The Galactica is the last of the 12 original Battlestars from the first Cylon war.'
}, {
    id: 'hitei-kan',
    label: 'Hitei Kan',
    value: 'Hitei Kan is the fleet\'s tylium processing ship and is one of the most important ships in the fleet.'
});
this.selector.show('colonial-one');
```

- A toggle

```html
<div ng-controller="DrpxToggleController as toggle">
    A long time ago, in a galaxy far, far away....<br>

    <div ng-click="toggle.toggle()">
        Show/Hide
    </div>
    <div ng-show="toggle.is()">
        This is the content <br>
        of the toggle.
    </div>

    <div ng-click="toggle.show()">
        Show toggle.
    </div>
    <div ng-click="toggle.hide()">
        Hide toggle.
    </div>

</div>
```

- A deferred service for model consistency update

```javascript
mode.update = function() {
    ...
};

drpxUpdateService.update(model);
```
