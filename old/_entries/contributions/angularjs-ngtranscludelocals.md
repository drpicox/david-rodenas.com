---
title: "AngularJS ngTranscludeLocals"
tags:
  - contributions
  - angularjs
  - angular
  - transclussion
  - javascript
date: 2016-04-06
source: https://github.com/angular/angular.js/pull/14386
description: >
    This contribution allows to 
    rename current template locals into a new locals
    inside a transclussion sections.
snippet: |
    ```html
    <!-- HeroListComponent.tpl.html -->
    <div ng-repeat="hero in $ctrl.heros">
        <ng-transclude ng-transclude-locals="{hero: hero}"></ng-transclude>
    </div>

    <!-- OverviewHeroList.tpl.html -->
    <ul>
    <hero-list>
        <li>{{hero.name}}</li>
    </hero-list>
    </ul>
    ```
---


The idea of this PR to avoid use $parent in cases like this:

```html
<!-- HeroListComponent.tpl.html -->
<div ng-repeat="hero in $ctrl.heros">
<ng-transclude></ng-transclude>
</div>

<!-- OverviewHeroList.tpl.html -->
<ul>
<hero-list>
    <li>{% raw %}{{$parent.hero.name}}{% endraw %}</li>
</hero-list>
</ul>
```

that could cease to work in cases like:

```html
<!-- OverviewHeroList.tpl.html -->
<ul>
<hero-list>
    <li ng-if="$parent.hero.power > 5">{% raw %}{{$parent.hero.name}}{% endraw %}</li>
</hero-list>
</ul>
```

and instead allow to use it:

```html
<!-- HeroListComponent.tpl.html -->
<div ng-repeat="hero in $ctrl.heros">
    <ng-transclude ng-transclude-locals="{hero: hero}"></ng-transclude>
</div>

<!-- OverviewHeroList.tpl.html -->
<ul>
<hero-list>
    <li>{% raw %}{{hero.name}}{% endraw %}</li>
</hero-list>
</ul>
```


It is in the IceBox, so meanwhile we can use this workaround:

```html
<!-- HeroListComponent.tpl.html -->
<div ng-repeat="hero in $ctrl.heros">
<ng-transclude></ng-transclude>
</div>

<!-- OverviewHeroList.tpl.html -->
<ul>
<hero-list>
    <li ng-init="hero = $parent.hero">{% raw %}{{hero.name}}{% endraw %}</li>
</hero-list>
</ul>
```
