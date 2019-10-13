---
title: "Unboxing Dependency Injection"
tags:
  - discussion
  - angular
date: 2015-05-29
description: >
    AngularJS dependency injection saves a lot of work, 
    and this feature comes out of the box.
    Beginners are usually puzzled by this feature, 
    many times misunderstood, but it saves
    a lot of time and simplifies drastically 
    the maintenance of large applications.
    Here I show few small examples that 
    illustrate how much work is saved by dependency injection
    and how it simplifies the maintenance of complex developments.
snippet: |
    ```javascript
    app.factory('Customer', function CustomerFactory() { ... });
    app.factory('customersState', function customersStateFactory(Customer,State) { ... });
    app.factory('Product', function ProductFactory() { ... });
    app.factory('productsState', function productsStateFactory(Product,State) { ... });
    app.factory('Cart', function CartFactory(customersState,productsState) { ... });

    // vs

    app.Customer = (function CustomerFactory() { ... })();
    app.customersState = (function customersStateFactory(Customer,State) { ... })(app.Customer,tools.State);
    app.Product = (function ProductFactory() { ... })(Product,State);
    app.productsState = (function productsStateFactory() { ... })(app.Product,tools.State);
    app.Cart = (function CartFactory(customersState,productsState) { ... })(app.customersState,app.productsState);
    ```
---

The opening example illustrates a simplified case of an app that has three main types of entities: Customer, Product and Cart. Additionally, it also considers two special _"controllers"_ that are supposed to be a kind of dictionary.


Modules with automatic dependency injection
-------------------------------------------

If you are creating modules for your application, for example a module for customers, another for products and another for the cart, you may change your creation to something like:


```javascript
var app = angular.module('app', ['app.customers','app.products','app.cart','tools.state']);

var customers = angular.module('app.customers', []);
customers.factory('Customer', function CustomerFactory() { ... });
customers.factory('customersState', function customersStateFactory(Customer,State) { ... });

var products = angular.module('app.products', []);
products.factory('Product', function ProductFactory() { ... });
products.factory('productsState', function productsStateFactory(Product,State) { ... });

var cart = angular.module('app.cart', []);
cart.factory('Cart', function CartFactory(customersState,productsState) { ... });
```


Some thoughts about this code:

- This code is highly declarative, we define what we instance and what we require, dependency injection fills the gap (we do not instance components and do not wire them),

- Only used components are instanciated, this is because angular does lazy injection,

- We agree that _app_ is the composition of at least the other three modules, 

- The order in which modules are defined is not relevant, for example, you can define _products_ before the _app_ module itself,

- Although _customers_ and _products_ modules requires a _State_ component instance to be injected, they do not define it, and they do not require any module which could define it, so they are _"abstract"_ (incomplete),

- Although _cart_ uses _CostumersState_ and _productsState_ instance, there is no definition neither other module requirement to fulfill that, so it is an _"abstract"_ (incomplete) module,

- Parent modules can redefine or decorate components if they need,


Note about _"abstract"_ modules: they are completed/configured by parent modules, for like _app_ in this example.



Modules with manual dependency injection
----------------------------------------

How we would created the same example without dependency injection? In this case, we need to manually create and reference modules similar as follows:


```javascript
var app = {};

app.customers = {};
app.customers.Customer = (function CustomerFactory() { ... })();
app.customers.customersState = (function customersStateFactory(Customer,State) { ... })(app.customers.Customer,tools.State);

app.products = {};
app.products.Product = (function ProductFactory() { ... })();
app.products.productsState = (function productsStateFactory(Product,State) { ... })(app.products.Product,tools.State);

app.cart = {};
app.cart.Cart = (function CartFactory(customersState,productsState) { ... })(app.customers.customersState,app.products.productsState);
```

In this code we can find that:

- This code is highly imperative, we must specify each detail of the process,

- It creates instances for all components, even if they are not used,

- Code order is highly relevant, for example, you must define and instance a customer before using it,

- There are no _"abstract"_ modules, you need to know which exactly instance of each required component,

- No redefinition possible of components in parent modules, you may have inconsistencies across modules,




Modules with npm like dependency definition
-------------------------------------------

What if we use _requirejs_, _browserify_, or similar to modularize our code?, Assuming that you split your code in files (one file per module, one file per component), the resultant code can be something like:

```javascript
/* app/customers/Customer.js */
module.exports = Customer;
// ...

/* app/customers/customersState.js */
var Customer = require('./Customer');
var State = require('tools/state/State');
module.exports = new State(Customer);
// ...

/* app/products/Product.js */
module.exports = Product;
// ...

/* app/products/productsState.js */
var Product = require('./Product');
var State = require('tools/state/State');
module.exports = new State(Product);
// ...

/* app/cart/Cart.js */
var customersState = require('../customers/customersState')
var productsState = require('../products/productsState')
module.exports = Cart;
// ...
```

Some notes about this code:

- It is almost declarative, it seems really close to angularjs, we _"do not"_ instance components, but we wire dependencies,  

- It only creates required instances,

- Modules are basically directory routes,

- Order is not relevant,

- There are no _"abstract"_ modules, each component knows exactly from which module gets its dependencies,

- No redefinition possible of components in parent modules, you may have inconsistencies across modules,

IMHO probably this last two points is the reason because so many frameworks relay in events and messages to communicate components, although it represents a programming risk because there are no direct communication, it allows to overcome the last two presented limitations.



Final thoughts
--------------

I have presented three ways of doing dependency injection:

- automatically: angularjs,
- manually: hard wiring,
- hybrid: browserify

It usually happens that AngularJS developers get for granted automatic dependency injection, but they do not know why it is here or which are the strong points.

With this three examples I want to show how it helps, in small scale, but just multiply for large applications: each automatic help saves lots of hours of development and debugging time.


Learn more
----------

[![Dependency Injection - Don't Look for Things!](http://img.youtube.com/vi/RlfLCWKxHJ0/0.jpg)](http://www.youtube.com/watch?v=RlfLCWKxHJ0)

http://misko.hevery.com/2008/11/11/clean-code-talks-dependency-injection/


