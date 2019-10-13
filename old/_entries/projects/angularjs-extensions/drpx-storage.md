---
title: "drpx-storage"
tags:
  - angularjs-extensions
  - services
  - projects
  - angularjs
  - storage
  - localforage
  - indexeddb
  - websql
  - component
  - npm
  - bower
  - contributions
date: 2015-06-04
source: https://github.com/drpicox/drpx-storage
description: >
    A Mozilla localForage wrapper for AngularJS
    that allows
    to store information in the browser using the best
    available option of the following engines:
    IndexedDB, WebSQL or localStorage.
snippet: |
    ```javascript
    class UsersStorageService {
        /* @ngInject */
        constructor(storageFactory) {
            this._storage = storageFactory('usersService');
        }
        getUser(idx) {
            return this._storage.getItem(idx);
        }
        getUserName(idx) {
            return this.getUser(idx).then(u => u.getName());
        }
    }
    ```
---

## Example

```javascript
/* @ngInject */
function UsersStorageService(storageFactory, $q) {
    var service = this;

    service._storage = storageFactory('usersService');

    service.getUser = function(idx) {
        return service._storage.getItem(idx);
    };
    service.getUserName = function(idx) {
        return service.getUser(idx).then(u => u.getName());
    };
    service.listUserIdx = function() {
        return service._storage.keys();
    };
    service.listUsers = function() {
        return service.listUserIdx().then(function(userIdxList) {
            return $q.all(userIdxList.map(function(idx) {
                return service.getGetUser(idx);
            }));
        });
    };
}
```


## Setup

Install the dependence with bower or npm:

```bash
$ npm install --save drpx-storage
```

Include the javascript library and also localForage script into your application.

```html
<script src="bower_components/localforage/dist/localforage.nopromises.js"></script>
<script src="bower_components/drpx-storage/drpx-storage.js"></script>
```

Add the module to your module.

```javascript
angular.module('yourModule', [ 'drpxStorage' ]);
```

See Github project for more information about usage.
