---
title: "AngularJS ngView route classes"
tags:
  - angularjs-extensions
  - view
  - projects
  - angularjs
  - routes
  - component
  - npm
  - bower
  - contributions
date: 2015-09-15
source: https://github.com/drpicox/drpx-class-route
description: >
    Allows to configure routes to 
    add and remove classes from 
    ngView (and other components) 
    that allows animations
    of view transition. 
snippet: |
    ```javascript
    $routeProvider.when('/', {
        template: '...',
        transition: {
            'from:/': 'fadein',     // opening transition
            'from:*': 'slideright', // transition from any other route
        },
        resolve: { ... }
    });
    ```
---

## Example

```css
.transition-fadein.ng-enter {
    transform: scale(1.15);
    opacity: 0;
}
.transition-fadein.ng-enter.ng-enter-active {
    transform: scale(1);
    opacity: 1;
}
.transition-fadein.ng-leave.ng-leave-active {
    transform: scale(1.15);
    opacity: 0;
}
``` 

```javascript
    $routeProvider.when('/', {
        template: '...',
        transition: {
            'from:/': 'fadein',     // opening transition
            'from:*': 'slideright', // transition from any other route
        },
        resolve: { ... }
    });
```

```html
<div ng-view autoscroll="1" drpx-class-route></div>
```


## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-class-route
```

Include the javascript library in your application.

```html
<script src="bower_components/drpx-class-route/drpx-class-route.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxClassRoute' ]);
```

See Github project for more information about usage.
