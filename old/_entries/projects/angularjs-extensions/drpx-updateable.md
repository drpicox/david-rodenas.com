---
title: "drpx-updateable"
tags:
  - angularjs-extensions
  - services
  - projects
  - angularjs
  - updateable
  - component
  - npm
  - bower
  - contributions
date: 2015-02-12
source: https://github.com/drpicox/drpx-updateable
description: >
    Small library with a service 
    to implement
    the MVS architecture with updateable events.
snippet: |
    ```javascript
    app.factory('yourService', function(drpxUpdateable) {
        var service = {
            change: function(...) {
                ...
                service.update();
            },
            update: drpxUpdateable('yourUpdate')
        }
        return service;
    }
    ```
---


## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-updateable
```

Include the javascript library into your application.

```html
<script src="bower_components/drpx-updateable/drpx-updateable.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxUpdateable' ]);
```

See Github project for more information about usage.
