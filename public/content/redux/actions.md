---
title: Redux Actions
tags:
  - redux
  - actions
---

# Redux Actions

Actions are plain JSON objects with a field with a string value called type.

```javascript
const action = {
  type: "string_constant",
  // …
};
```

## Actions

![Redux Actions](/images/redux/redux-action.png)

Actions are JSON objects with a property called **type** that is string.

```javascript
{
  type: 'duck1/ACTION_TYPE',
  // action specific fields ...
}
```

### Defining new Actions

Action types are stored in **constants** and exported so they can be widely
used.

```javascript
// src/store/duck1/actions.js
export const ACTION_TYPE = "duck1/ACTION_TYPE";
```

Actions are created with **actionCreator** functions.

```javascript
// src/store/duck1/actions.js
export function actionType(other, fields) {
  return {
    type: ACTION_TYPE,
    other,
    fields,
  };
}
```

> **Small note:** In javascript, if you create an object with a field that has
> the same of the variable that contains it, it is a good practice to use the
> short notation
>
> ```javascript
> var field = XXX;
> // WRONG: instead of
> return { field: field };
> // OK: use
> return { field };
> ```

#### Example

```javascript
// src/store/views/actions.js
export const VIEW_PUSHED = "views/VIEW_PUSHED";

export function viewPushed(newView) {
  return {
    type: VIEW_PUSHED,
    newView,
  };
}

export const VIEW_POPPED = "views/VIEW_POPPED";

export function viewPoped() {
  return {
    type: VIEW_POPPED,
  };
}
```

```javascript
// example of action (created by viewPushed)
const viewPushedAction = {
  type: "views/VIEW_PUSHED",
  newView: { name: "Villains" },
};

// example of action dispatch
store.dispatch(viewPushed({ name: "Villains" }));
```