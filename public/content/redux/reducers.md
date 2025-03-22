---
title: Redux Reducers
tags:
  - redux
  - reducers
---

# Redux Reducers

Reducers are functions responsible to create the next state given the current
state and an action.

## Reducers

![Redux Reducer](/images/redux/redux-reducer.png)

Reducers are pure functional functions, that given the current state, and a
dispatched action, they return the next state (without modifying anything else).

### Defining reducers

```javascript
// src/store/duck1/reducers.js
import { ACTION_TYPE /* … */ } from "./actions";

const initialState = XXX;

export function reduceDuck1(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPE:
      return f(state, action);

    /* … */

    default:
      return state;
  }
}
```

All ducks reducers follow the same structure.

- It exports the **function** called **reduce** and the duck name
- The reduce function is **pure functional**, so it cannot modify any argument,
  or access to any variable outside the function (only constants).
- The first argument of the function is the **state**.
- It uses the default value syntax to assign the **initialState**.
- The second argument is an **action**, the action received by the store with
  dispatch.
- The body is a unique **switch**,
- It switches over **action.type**s.
- It has a **case** for each relevant action type that implies an update.
- Each case computes a new state and **return**s it.
- Reducers do not need to handle all actions, but they receive all. When there
  is an unexpected action, it returns the state in the **default** case.

> **Important**: The reducer does not receives the whole state. When combined
> with `combineReducers` it only receives the slice of the state corresponding
> to its duck. So it has no access to anything else.

> **Hint**: In javascript all imported symbols exists, but if they are not
> exported, their value is undefined.
>
> ```javascript
> import { UNEXISTING_TYPE } from "./actions";
>
> export function reduceDuck1(/* … */) {
>   switch (action.type) {
>     // this case
>     case UNEXISTING_TYPE:
>     // is the same to:
>     case undefined:
>
>     /* … */
>   }
> }
> ```

#### Example

```javascript
// src/store/views/reducers.js
import { VIEW_PUSHED, VIEW_POPPED } from "./actions";

const initialState = [];

export function reduceViews(state = initialState, action) {
  switch (action.type) {
    case VIEW_PUSHED:
      return reduceViewPushed(state, action);
    case VIEW_POPPED:
      return reduceViewPopped(state, action);
    default:
      return state;
  }
}

function reduceViewPushed(state, action) {
  const newState = [...state];
  newState.push(action.newView);
  return newState;
}

function reduceViewPopped(state, action) {
  const newState = [...state];
  newState.pop();
  return newState;
}
```

## Combine Reducers

![combineReducers](/images/redux/combine-reducers.png)

The Redux function combine reducers creates a new reducer by combining
(composing). It slices the state for each composed reduced by name and composes
all the results into one single state.

### Pseudo-algorithm

```javascript
// it is provided by import { combineReducers } from 'redux';
// do not implement, the actual version is far more optimum
export function combineReducers(reducers) {
  const initialState = {};

  // it returns a new reducer function that combines previous reducers
  return function mainReducer(mainState = initialState, action) {
    // Combines all reducers
    const newMainState = {};
    for (let slice in reducers) {
      const reducer = reducers[slice];
      newMainState[slice] = reducer(mainState[slice], action);
    }

    if (areShallowEqual(newMainState, mainState)) return mainState;
    else return newMainState;
  };
}
```

### Usage

```javascript
// src/store/index.js
import { combineReducers, createStore } from "redux";
import { reduceDuck1 } from "./duck1/reducers";
import { reduceDuck2 } from "./duck2/reducers";
/* … */

const mainReducer = combineReducers({
  duck1: reduceDuck1,
  duck2: reduceDuck2,
  /* … */
});

export function createMainStore() {
  return createStore(mainReducer);
}
```

#### Example

```javascript
// src/store/index.js
import { combineReducers, createStore } from "redux";
import { reduceViews } from "./views/reducers";
import { reduceVillains } from "./villains/reducers";
/* … */

const mainReducer = combineReducers({
  views: reduceViews,
  villains: reduceVillains,
});

export function createMainStore() {
  return createStore(mainReducer);
}
```