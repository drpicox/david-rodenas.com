---
title: Redux Ducks
tags:
  - redux
  - ducks
---

# Redux Ducks

Ducks are reusable redux store modules.

## Ducks

![Redux Ducks](/images/redux/redux-ducks.png)

Ducks are modules for Redux stores. Each one provides of one slice of the state,
the corresponding reducer, actions and selectors.

### Duck structure

The structure of ducks is the following:

```
- src/store
  - duck1/
    - actions.js
    - reducers.js
    - selectors.js
  - duck2/
    - actions.js
    - reducers.js
    - selectors.js
  - …
```

### Accessing other ducks selectors

Selectors of one duck can use the selectors of another duck by importing them.

```javascript
// src/store/duck2/selectors.js
import { selectDuck1Something } from "../duck1/selectors";

export function selectDuck2Something(state) {
  const something = selectDuck1Something(state);
  return f(something);
}
```

### Combining ducks

Ducks are combined into the Store with combineReducers.

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