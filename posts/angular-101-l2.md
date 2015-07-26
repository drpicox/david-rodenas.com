---
title: "Angular 101 - L2"
subtitle: "Guess a number game app"
tags:
  - teaching
  - angular
date: 2015-07-26
abstract: >
    In the previous article we just have started with Angular.
    Now it is time to do something more challenging.
    What about to create a game to guess a number?
    This article will go deeper inside controllers, 
    will show how to use data models,
    will show how to use dependency injection,
    and will show how to repeat and nest visual components.
snippet: |
    ```html
    <input type="number" ng-model="vm.number">
    <button ng-click="vm.guess()">Guess</button>
    <div ng-show="vm.guessed">You number is {{vm.result}}!</div>
    ```
prev: angular-101-l1
---

## Chapter 1: Your first double data binding

Angular updates the view of the app automatically when data
changes, and at the same time, if a view changes a data, 
angular updates it. Let's see what that means:

1. Create a folder (example angular-101-l2). 
2. Inside create a file called `index.html`:

    ```
    - angular-101-l1/
      - index.html
    ```

3. Fill `index.html` with the following content:

    ```html
    <html>
      <head>
        <title>Angular 101 - L2</title>
      </head>
      <body ng-app>
        <!-- load angular library -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js"></script>
        
        <!-- watch the mighty double binding -->
        Think in a number: <input type="number" ng-model="vm.number"><br>
        Your number is: {{vm.number}}.
      </body>
    </html>
    ```

4. Execute the http-server in that folder:

    ```bash
    $ http-server -c-1 -p 8080
    ```

5. Open http://localhost:8080/ in your browser.

6. Write the number that you think.

  ![app preview](posts/images/angular-101-l2-ch1-6.png)

Whoa! As your write the number it updates automatically.

That is double binding, as you type a number, 
angular saves the number at `vm.number` (first binding), 
but at the same, when `vm.number` changes, 
angular updates all parts of the view where it is used (second binding).


> **Important Note**: If you use `ng-model="something"` you 
> should use the _dot notation_ inside something, that means
> that you should have a '.' inside. For example: 
> you should use `ng-model="vm.number"` not `ng-model="number"`,
> the first has a dot, the second doesn't. If you do not follow
> this rule, you may have strange problems.
> You have been warned.


## Chapter 2: Your turn. Guess my number

Ok, let's play serious. 
We want to have a small app able to guess the number that the computer is thinking. In addition, the app will give hints, if the number is larger or smaller. So, let's start.

1. Create the following directory structure:

    ```
    - angular-101-l1/
      - index.html
      - guessApp.js
      - GuessDirective.js
      - GuessDirective.tpl.html
    ```

2. Modify the `index.html` as follows:

    ```html
    <html>
      <head>
        <title>Angular 101 - L2</title>
      </head>
      <body ng-app="guessApp">
        <!-- load angular library -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js"></script>
        <script src="guessApp.js"></script>
        <script src="GuessDirective.js"></script>

        <!-- use your directive -->
        <ga-guess></ga-guess>
      </body>
    </html>
    ```

3. Fill `guessApp.js` with the following code:

    ```javascript
    angular.module('guessApp', []);
    ```

4. Fill `GuessDirective.js` with the following code:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .directive('gaGuess', GuessDirective);

        function GuessDirective() {
            var directive = {
                restrict: 'E',
                templateUrl: './GuessDirective.tpl.html',
                scope: {},
                controller: GuessController,
                controllerAs: 'vm',
            };

            return directive;
        }

        GuessController.$inject = [];
        function GuessController  () {
            var vm = this;

            vm.number = 0;      
            vm.guessed = false;
            vm.result = '';
            vm.guess = guess;//()

            var secret = Math.ceil(Math.random() * 10);

            function guess() {
                if (secret === vm.number) {
                    vm.result = 'the same';
                } else if (secret < vm.number) {
                    vm.result = 'smaller';
                } else if (secret > vm.number) {
                    vm.result = 'greater';
                }
                vm.guessed = true;
            }
        }
    })();
    ```

4. Fill `GuessDirective.tpl.html` with the following template:

    ```html
    Think in a number: <br>
    <input type="number" ng-model="vm.number"><br>

    <button ng-click="vm.guess()">Guess</button><br>
    <div ng-show="vm.guessed">My number is {{vm.result}}!</div><br>
    ```

5. Use `http-server -c-1 -p 8080` to open, and play with it at http://localhost:8080

![app preview](posts/images/angular-101-l2-ch2-5.png)

Yeah! An app that thinks a number! And it even gives hints to you.
Finally, you have a two way communication with your app.


## Chapter 3: Clean up the controller

In the previous example we have used one single controller to configure the view and compute the logic of the app. This is not a good idea. 

In this chapter we will split the GuessDirective in two parts, the GuessDirective itself and a service which is responsible for the guesser logic (GuesserState): to think a secret number and let be asked if your number is ok.
The way to use the GuesserState from the GuessDirective is by injection: in the controller we say that we want the guesserState and Angular finds and instance and give it to us automatically.

In addition, we also add a new directive: GuessResultDirective. This directive just show the result with nice readable text. But this directive needs to know the result, so, it has a parameter: the result itself.


1. Complete the directory structure as follows:

    ```
    - angular-101-l1/
      - index.html
      - guessApp.js
      - GuessDirective.js
      - GuessDirective.tpl.html
      - GuesserState.js
      - GuessResultDirective.js
      - GuessResultDirective.tpl.html
    ```

2. Update `index.html` to add new files:

    ```html
    <html>
      <head>
        <title>Angular 101 - L2</title>
      </head>
      <body ng-app="guessApp">
        <!-- load angular library -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js"></script>
        <script src="guessApp.js"></script>
        <script src="GuessDirective.js"></script>
        <script src="GuesserState.js"></script>
        <script src="GuessResultDirective.js"></script>

        <!-- application views -->
        <ga-guess></ga-guess>
      </body>
    </html>
    ```

3. Create the `GuesserState.js` with the following state:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .factory('guesserState', GuesserStateFactory);

        function GuesserStateFactory() {
            var state = {
                guess: guess,
            };

            var secret = Math.ceil(Math.random() * 10);

            return state;

            function guess(number) {
                var result;

                if (secret === number) {
                    result = 0;
                } else if (secret < number) {
                    result = -1;
                } else if (secret > number) {
                    result = 1;
                }
                return result;
            }
        }
    })();
    ```

4. Update `GuessDirective.js` to use the `guesserState`:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .directive('gaGuess', GuessDirective);

        function GuessDirective() {
            var directive = {
                restrict: 'E',
                templateUrl: './GuessDirective.tpl.html',
                scope: {},
                controller: GuessController,
                controllerAs: 'vm',
            };

            return directive;
        }

        GuessController.$inject = ['guesserState'];
        function GuessController  ( guesserState ) {
            var vm = this;

            vm.number = 0;      
            vm.guessed = false;
            vm.result = '';
            vm.guess = guess;//()

            function guess() {
                vm.result = guesserState.guess(vm.number);
                vm.guessed = true;
            }
        }
    })();
    ```

5. Implement `GuessDirectiveResult.js` as follows:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .directive('gaGuessResult', GuessResultDirective);

        function GuessResultDirective() {
            var directive = {
                restrict: 'E',
                templateUrl: './GuessResultDirective.tpl.html',
                scope: {},
                controller: GuessResultController,
                controllerAs: 'vm',
                bindToController: {
                    result: '='
                },
            };

            return directive;
        }

        GuessResultController.$inject = [];
        function GuessResultController  () {
        }

    })();
    ```

6. Fill `GuessResultDirective.tpl.html`:

    ```html
    <ng-switch on="vm.result">
        <span ng-switch-when="0">Congratulations, that's my number!</span>
        <span ng-switch-when="-1">My number is smaller.</span>
        <span ng-switch-when="1">My number is greater.</span>
    </ng-switch>
    ```

7. Update `GuessDirective.tpl.html` to use the `<ga-guess-result>` directive:

    ```html
    Think in a number: <br>
    <input type="number" ng-model="vm.number"><br>

    <button ng-click="vm.guess()">Guess</button><br>
    <div ng-show="vm.guessed">
        <ga-guess-result data-result="vm.result"></ga-guess-result>
    </div><br>
    ```

8. Use `http-server -c-1 -p 8080` to open, and play with it at http://localhost:8080

![app preview](posts/images/angular-101-l2-ch3-8.png)

Much better. Now, thanks to bindToController, you know how to assign parameters from the view to the controller.


## Chapter 4: Record the history

Until now we are showing simple values: numbers, texts, ... but we usually want to show lists of results and multiple items. Angular has a special directive called [`ngRepeat`](https://docs.angularjs.org/api/ng/directive/ngRepeat), it allows to repeat parts of the view to iterate collections of data. 

In this chapter we will record each attempt to guess the number and show it below. As significant improvement, we simplify the GuessDirective: it just takes advantage that GuesserState does all the work.


1. Complete the directory structure as follows:

    ```
    - angular-101-l1/
      - index.html
      - guessApp.js
      - GuessHistoryDirective.js
      - GuessHistoryDirective.tpl.html
      - GuessDirective.js
      - GuessDirective.tpl.html
      - GuesserState.js
      - GuessResultDirective.js
      - GuessResultDirective.tpl.html
    ```

2. Update `index.html` to add new files:

    ```html
    <html>
      <head>
        <title>Angular 101 - L2</title>
      </head>
      <body ng-app="guessApp">
        <!-- load angular library -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js"></script>
        <script src="guessApp.js"></script>
        <script src="GuessDirective.js"></script>
        <script src="GuesserState.js"></script>
        <script src="GuessHistoryDirective.js"></script>
        <script src="GuessResultDirective.js"></script>

        <!-- application views -->
        <ga-guess></ga-guess>
      </body>
    </html>
    ```

3. Update `GuesserState.js` to record the history:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .factory('guesserState', GuesserStateFactory);

        function GuesserStateFactory() {
            var state = {
                history: [],//[{number:, result:, attemptNo:}]
                guess: guess,//(number)
            };

            var secret = Math.ceil(Math.random() * 10);

            return state;

            function guess(number) {
                var result;

                if (secret === number) {
                    result = 0;
                } else if (secret < number) {
                    result = -1;
                } else if (secret > number) {
                    result = +1;
                }

                state.history.push({number:number, result:result, attemptNo: state.history.length + 1});
                return result;
            }
        }

    })();
    ```

5. Create `GuessHistoryDirective.js` with the *history* binding:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .directive('gaGuessHistory', GuessHistoryDirective);

        function GuessHistoryDirective() {
            var directive = {
                restrict: 'E',
                templateUrl: './GuessHistoryDirective.tpl.html',
                scope: {},
                controller: GuessHistoryController,
                controllerAs: 'vm',
                bindToController: {
                    history: '='
                },
            };

            return directive;
        }

        GuessHistoryController.$inject = [];
        function GuessHistoryController  () {
        }

    })();
    ```

6. Create `GuessHistoryDirective.tpl.html` to show all history entries:

    ```html
    <ul>
        <li ng-repeat="entry in vm.history track by entry.attemptNo">
            {{entry.attemptNo}}:
            Your number was {{entry.number}}.
            <ga-guess-result data-result="entry.result"></ga-guess-result>
        </li>
    </ul>
    ```

7. Simplify `GuessDirective.js` controller:

    ```javascript
    ;(function() {
        'use strict';

        angular
            .module('guessApp')
            .directive('gaGuess', GuessDirective);

        function GuessDirective() {
            var directive = {
                restrict: 'E',
                templateUrl: './GuessDirective.tpl.html',
                scope: {},
                controller: GuessController,
                controllerAs: 'vm',
            };

            return directive;
        }

        GuessController.$inject = ['guesserState'];
        function GuessController  ( guesserState ) {
            var vm = this;

            vm.number = 0;
            vm.guesser = guesserState;      
        }
        
    })();
    ```

8. Update `GuessDirective.tpl.html` to use `<ga-guess-history>` directive and simplified controller API:

    ```html
    Think in a number: <br>
    <input type="number" ng-model="vm.number"><br>

    <button ng-click="vm.guesser.guess(vm.number)">Guess</button><br>
    <ga-guess-history data-history="vm.guesser.history"></ga-guess-history>
    ```

8. Use `http-server -c-1 -p 8080` to open, and play with it at http://localhost:8080

![app preview](posts/images/angular-101-l2-ch4-8.png)


## Chapter 5: Make it prettier

Ok, it is awesome but it is not very appealing. It is time to add boostrap an make it look nice and attractive.

1. Update `index.html` to include bootstrap and define a responsive container:

    ```html
    <html>
      <head>
        <title>Angular 101 - L2</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
      </head>
      <body ng-app="guessApp">
        <!-- load angular library -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js"></script>
        <script src="guessApp.js"></script>
        <script src="GuessDirective.js"></script>
        <script src="GuesserState.js"></script>
        <script src="GuessHistoryDirective.js"></script>
        <script src="GuessResultDirective.js"></script>

        <!-- application views -->
        <br>
        <div class="container">
          <ga-guess></ga-guess>
        </div>
      </body>
    </html>
    ```

2. Use bootstrap in `GuessDirective.tpl.html`:

    ```html
    <div class="panel panel-default">
        <div class="panel-body">
            <form>
                <div class="form-group">
                    <label>Think in a number:</label>
                    <input type="number" ng-model="vm.number" class="form-control">
                </div>

                <button ng-click="vm.guesser.guess(vm.number)" type="submit" class="btn btn-primary">Guess</button>
            </form>
        </div>
        <div class="panel-footer" ng-show="vm.guesser.history.length > 0">
            <ga-guess-history data-history="vm.guesser.history"></ga-guess-history>
        </div>
    </div>
    ```

3. Use boostrap in `GuessHistoryDirective.tpl.html`:

    ```html
    <ul class="list-group">
        <li ng-repeat="entry in vm.history track by entry.attemptNo" class="list-group-item" 
        ng-class="{'list-group-item-success': entry.result === 0}">
            <span class="badge">{{entry.attemptNo}}</span>
            <h5 class="list-group-item-heading">
                <ga-guess-result data-result="entry.result"></ga-guess-result>
            </h5>
            <p class="list-group-item-text text-muted">Your number was {{entry.number}}.</p>
        </li>
    </ul>
    ```

4. Use `http-server -c-1 -p 8080` to open, and play with it at http://localhost:8080

![app preview](posts/images/angular-101-l2-ch5-4.png)

Yeah! That's better. And all that we have done is to use from bootstrap
[Panels](http://getbootstrap.com/components/#panels-footer),
[List groups](http://getbootstrap.com/components/#list-group-custom-content)
and [Badges](http://getbootstrap.com/components/#badges).

## Did you know that...

- You can see the example running [here](http://david-rodenas.com/angular-101-l2)

- `;(function() { ... })()` is an [iffe](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression), its purpose is to avoid leaking global variables,

- `'use strict';` is a Javascript directive that activates special 

- `type="number"` comes from HTML, see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type , but at the same time, angular leverages on it to give a smart behaviour https://docs.angularjs.org/api/ng/input/input%5Bnumber%5D 

- *why it is so important keep the directive small?* Because directive controllers have only one responsability: configure the view (give to the view all data and functions that it needs). Unfortunately, to do such task, it couples too many things from too many layers. In such case, because we cannot do other thing, coupling is required by program logic, better to keep it as simple and smaller possible.