---
title: "Updateable pattern or flux-for-angular"
tags:
  - drpx-updateable
  - angularjs
  - flux
  - patterns
  - architecture
  - updateable
date: 2015-03-02
description: >
  This last year Flux had become highly popular, 
  but how it can be applied to Angular? 
  Here I present an alternative mechanism 
  more in line with Angular philosophy.
snippet: |
    ```javascript
    function YourState(drpxUpdateable) {
      var $update = drpxUpdateable('yourUpdate');
      this.change = function(...) {
        ...
        $update();
      }
    }
    ```  
---

The main reason because Flux became highly popular is the following: an architecture that allows to create large and maintainable applications. In the following video Facebook people explains how and why they developed it:

[![Why FLUX](http://img.youtube.com/vi/nYkdrAPrdcw/0.jpg)](https://www.youtube.com/watch?v=nYkdrAPrdcw&list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v#t=621)

In https://facebook.github.io/flux/docs/overview.html describes detailed the Flux flow wich is the following:

           --------------           -------------           -------------
          |              |         |             |         |             |
          |  Dispatcher  |  ---->  |    Store    |  ---->  |    View     |  
          |              |         |             |         |             |
           --------------           -------------           -------------
                  ^                                               |
                  |                                               |
                  |                 -------------                 |
                  |                |             |                |
                   --------------  |   Action    |  <-------------
                                   |             |
                                    ------------- 

> All data flows through the dispatcher as a central hub. Actions are provided to the dispatcher in an _action creator_ method, and most often originate from user interactions with the views. The dispatcher then invokes the callbacks that the stores have registered with it, dispatching actions to all stores. Within their registered callbacks, stores respond to whichever actions are relevant to the state they maintain. The stores then emit a _change_ event to alert the controller-views that a change to the data layer has occurred. Controller-views listen for these events and retrieve data from the stores in an event handler. The controller-views call their own `setState()` method, causing a re-rendering of themselves and all of their descendants in the component tree.

## Flux defects

I will no write about Flux wonders, there are lots of them in Internet, but it has some drawbacks:

- **Too many code**:
Flux code is very verbose, it requires to put down everything with  high degree of detail. The good part is that there is no magic, anyone will potentially know how it works. The bad part is as more lines of code you have, more probability to add a bug inside. It's just math.

- **New action many redos**: 
In Flux actions are handled by dispatcher in order to allow Stores update themselves in a proper order to guarantee the application state consistency. 
It is a good approach to having a full consistent state, specially when you 
have few actions dealing with few stores, but as larger your app gets more and more
stores and actions are created, and application maintainability cost grows quadratically:
you have to be sure that all action-store relationships are ok.
This adds an undesired coupling between stores and actions breaking any
attempt to perform [SOLID](http://en.wikipedia.org/wiki/SOLID_%28object-oriented_design%29) development: do not let freeze stores in a stable version. For example, a todo list, with actions to mark a todo as done and all todos as done, if we add for instance add old todos as done action, all related stores must have logic for the new action, even those what could be freezed.

- **Don't forget unregister**: 
How many times you forgot to unregister a watch and garbage is maintained? This is a real potential risk. Views observes Stores, so, they need to register as observer when the view is created and unregister when the view is destroyed. This is not optional, is how Flux works and required by almost every view. If you forget an unregister some observer, state will remain and probably your app heap size will grow until failure. You need tools, and extra time, to watch that this does not happen.

- **Too many messages?**: 
Flux works with messages, events, how you want to describe. Events are cool to decouple things, but sometimes we decouple things too much, even Misko explains [here risks of events](https://www.youtube.com/watch?v=ZhfUv0spHCY&t=54m35s). With events it is easy to miss an existing relation, and code debugging is more complex (which message is running now from where to where). Flux puts a bit of order in messaging, but there are tons of listeners running every time.


## Flux for Angular?

Please don't. 

Angular philosophy goes in the opposite way: use less messages/observers relay more in direct model touch. If we study how views work in Angular, they are a almost like observers: views observe values and updates itself when values are changed. The interesting point of angular is that instead using Observer pattern registering views in the model, it uses dirty-checking, so no registering is required, no forget to unregister, ... Even better, everything of a view happens inside a $scope (the view configuration), when the view is removed, watchers are removed so event listeners. Clean, neat, and slip-safe.

What's the objective of Angular? Easier programming, less code, and better consistency. It is because most of the checking, observing and view updates are performed by Angular itself, we do not need to care when to update views, maintain a consistent state, ... So it is a good property that we do not want to lose. If we start adding code to do manually all those things, Angular will become analogous to any other library like Underscore or jQuery, so we do not want to do this.

But, does Angular have less performance with its dirty checking? Nope. Ok it is a little bit tricky and it need proof, but there are ways. What I have discovered the following: Angular does massive quick checkings, and usually they are really fast, but this checkings are performed only over models presents in the view, and updates and recomputations are based only in what is used in views. Other frameworks use direct messaging, events, ... which may seem more efficient (changes and checkings are more chirurgical), but it is just an appearance. Every time that something happens a synchronization event is required, it usually triggers more events, and more; everything that is related is updated, not just only what are in views in just that moment. Even worse, something usually not taken into consideration, Angular digest loop is just a plain loop, no complex fashion and easy to predict pattern accesses, which makes processors and caches happy (although it is Javascript), but with events it gets more complex, with difficult to predict branching, and its full of complex paths. So... may be Angular is faster, and if not, it is fast enough.

The hard point in Angular: complex queries or derived/computed values. Most simple way to handle it is make them as part of the data shown in the view, but, any complex function may increase too much the digest loop. That is something that we do not want. So, back to Flux? Not at all, here I propose the alternative: updateable _pattern_ .


## Updateable pattern

Updateable pattern is a heavy simplification of the Flux architecture, it has two parts: States (a kind of stores), and Reactors (basically other states and view controllers). 

                     --------------           -------------
                    |              |         |             |
                    |    state     |  ---->  |   Reactor   | 
                    |              |         |             |
                     --------------           -------------

State holds a model of the app and has one specific method called `$update` invoked when its model is changed. Update method `$rootScope.$broadcast` debounced with eventname `stateUpdate` and no params. Reactors, which can be other states, processes (`module.run`), or view-controllers, just listen for events with `$scope.$on` (rootScope if it is a state or process). Reactors, before start, updates themselves using state models, and also use the same function to update themselves when the event is triggered, so there is always a consistency.

A helper library can be found at: [drpx-updateable](https://github.com/drpicox/drpx-updateable).

$update code is just the following:

```javascript
    var notifying = false;
    function $update() {
      if (notifying) { return; }

      notifying = true;
      $rootScope.$applyAsync(function updateBroadcast() {
        notifying = false;
        $rootScope.$broadcast(event);
      });
    }
```

To use it just add this code to your **state**:

```javascript
    yourServiceFactory.$inject = ['drpxUpdateable'];
    function yourServiceFactory  ( drpxUpdateable ) {
        var service = {
            change: change,
            // your other methods

            $update: drpxUpdateable('yourUpdate')
        }

        function change(...) {
            // do your changes
            service.$update();
        }

        return service;
    }
```

And you can listen for it in your **reacter** controller as follows:

```javascript
    YourController.$inject = ['yourService','$scope'];
    function YourController  ( yourService , $scope ) {
        var vm = this;
        $scope.$on('yourUpdate', update);
        update();

        function update() {
            vm.data = yourService.data;            
        }
    }
```

Key points of this patterns are: only update event is provided with no data (it must be fetched from the original service), independent of which actions are made (even bulk updates triggers update once thanks to debouncing), and keeps as close as possible to the original angular philosophy.

For what updateable is designed to:

- **maintain always data integrity**: because update does not provides extra information about what is changed, all must be recomputed (in angular style), so only one point to maintain (it uses a model of eventually data consistency),

- **scalable functionality**: because update does not provides information about which operation is done, all must be recomputed so it does not matter if new method/option/whatever is added, so states can become SOLID,

- **efficient**: updateable runs asynchronous debounced, so even if multiple calls to update are performed (example: a bulk addition of data) event is triggered once, so only one recomputation is required (data is eventually consistent),

- **integrated with digest loop**: all updates are performed inside a digest loop, no need for $scope.$apply() or whatever,

- **almost no garbage left**: update events are handled by angular $broadcast, so controllers/... can handle it by listening from their own $scope which listener is destroyed along its $scope when it is not longer required

- **simplicity**: just do $scope.$on('yourEvent', function() { ... }) and recompute what you need, no more register/unregister/...



So, next time, just before trying to use Flux in Angular, just give a try to Updateable pattern/architecture.


