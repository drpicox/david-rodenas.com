---
title: "Angular providers"
subtitle: "providers, factories, services, values, constants"
tags:
  - teaching
  - angular
date: 2015-05-08
abstract: >
    One of the most difficult parts to angular newcomers is to
    understand the concept of factories, services, and the hardest
    one are provider. Nevertheless they are quite simple and, 
    surprisingly all them are just sugar syntax to make providers.
    Provider is the basic tool of angular dependency injection
    and in this article I show in few examples how are they related.
snippet: |
    ```javascript
    function Logger() {
        this.log = function(msg) { console.log(msg); };
    }
    // ..choose..
    module.value('logger', new Logger());
    // ..or..
    module.service('logger', Logger);
    // ..or..
    module.factory('logger', function() { return new Logger(); });
    // ..or..
    module.provider('logger', function() {
        this.$get = function() { return new Logger(); };
    });
    ```
---

All this four example does exactly the same, and Yes, almost all components in Angular are providers: values, services, factories, directives... And you didn't noticed, aren't you?

### What the example does?

Let's look carefully to the introduction example. It proposes many ways to create and injectable logger. First, it defines a constructor called Logger (builds an object with one method, log). Next, you can choose which way do you prefer to create an injectable logger. It does not matter how you have defined the `logger`, use it just as simple as follows:

```javascript
    module.controller('LoggyController', function(Logger) {
        Logger.log('LoggyController started.');
        / /...
    });
```

### So, ¿why there are so many ways to do the same?

They are just sugar syntax. Value, service and factory are just shortucts to create providers. Their implementation could be the following:

```javascript
module.value = function (name, value) {
    module.provider(name, function() {
        this.$get = function() { return value; };
    });
}
module.service = function (name, Service) {
    module.provider(name, function() {
        this.$get = function(/* di */) { return new Service(/* di */); };
    });
}
module.factory = function (name, factory) {
    module.provider(name, function() {
        this.$get = factory;
    });
}
```

Actual implementation is at https://github.com/angular/angular.js/blob/v1.3.15/src/auto/injector.js#L686-L698 .


_Value_ just create a provider that returns the value, this value would be the one injected.
_Service_ creates a provider that creates an object with the contructor using injected dependecies as arguments, this new object is the value injected.
_Factory_ creates a provider that invokes the factory function which creates the value to be injected.

Probably _factory_ is the most common one.


### But, ¿why providers? ¿are they useful?

A resounding yes. The most important part of providers is that they can be configured. For example:

```javascript
module.provider('logger', function() {
    var config = this.config = {
        endpoint: '/api/logs',
    };
    this.$get = function($http) {
        var service = {
            log: log,
        };
        return service;

        function log() {
            $http.post(config.endpoint, {params:arguments});
        }
    };
});
```

and the configuration:

```javascript
module.config(function('loggerProvider') {
    LoggerProvider.config.endpoint = '/services/v2/log'; 
});
```

Note that:
- angular automatically appends `Provider` to the service name,
- the `logger` can still be used following the previous example,
- config functions only can receive _Provider_s, nothing else.

All _config_ functions take place before any other service uses defined services, so it helps to ensure that everything would be properly configured before it is been used. For example, never (I repeat, never) would be any kind of _post_ method to _/api/logs_ path, because there is a configuration function that overwrites it before Logger is used.


### So, ¿when I use each?

Easy as pie, try to use the simplest form, so it takes the less amount of bytes possible. But, when you are writing modules that would be reused in multiple apps, you should consider write providers, so you let each app to configure them.
