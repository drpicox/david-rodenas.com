---
title: Redux Selectors
tags:
  - redux
  - selectors
---

# Redux Selectors

Selectors are functions that makes a query over the main state;

## Selectors

![Redux Selector](/images/redux/redux-selector.png)

Selectors are pure functional functions, that given the main state, and options,
it returns a result (without modifying anything).

```javascript
// src/store/duck1/selectors.js
export function selectDuck1Something(mainState, { option1, option2 /* … */ }) {
  return f(mainState, { option1, option2 /* … */ });
}

export function selectDuck1SomethingElse(
  mainState,
  { option1, option2 /* … */ }
) {
  return f(mainState, { option1, option2 /* … */ });
}
```

> **Important**: consecutive calls to the same selector, with the same
> arguments, must return always the same instance result.
>
> ```javascript
> const resultCall1 = selectDuck1Something(mainState, { option1: "value1" });
> const resultCall2 = selectDuck1Something(mainState, { option1: "value1" });
> // note that .toBe means the exact same instance
> expect(resultCall1).toBe(resultCall2);
> ```

> **Note**: In testing, there is `toBe`, and there is `toEqual` or
> `toMatchObject`. The case of _toBe_ means that both variables must be
> exactly the same instance, but with _toEqual_ they must just look the same,
> and with _toMatchObject_ must contain the same fields.
>
> ```javascript
> const object = { a: 1, b: 2 };
>
> // it is success
> expect(object).toBe(object);
> expect(object).toEqual(object);
> expect(object).toMatchObject(object);
> expect(object).toEqual({ a: 1, b: 2 });
> expect(object).toMatchObject({ a: 1, b: 2 });
> expect(object).toMatchObject({ a: 1 });
>
> // it is failure
> expect(object.toBe({ a: 1, b: 2 })); // not same instance
> expect(object).toEqual({ a: 1 }); // not equals
> ```

#### Examples

```javascript
export function selectViews(mainState) {
  return mainState.views;
}

export function selectViewByTop(mainState) {
  const views = selectViews(mainState);
  return views[views.length - 1];
}
```

## Memoization

See [reselect](https://github.com/reduxjs/reselect).

![Redux Make Selector](/images/redux/redux-make-selector.png)

Use a **function that returns a function** to create a selector with
memoization.

```javascript
// src/store/duck1/selectors.js
import { createSelector } from "reselect";

/* … */

export function makeSelectDuck1Something() {
  return createSelector(
    selectA,
    selectB,
    // …,
    (a, b /*, … */) => {
      return f(a, b /*, … */);
    }
  );
}
```

It creates a selector with memorization of one element that is the last call.

```javascript
import { makeSelectDuck1Something } from "../store/duck1/selectors.js";

const selectDuck1Something = makeSelectDuck1Something();
const resultCall1 = selectDuck1Something(mainState, { option1: "value1" });
const resultCall2 = selectDuck1Something(mainState, { option1: "value1" });
expect(resultCall1).toBe(resultCall2);
```

> **Note**: Because Redux is a state management system similar to a in memory
> database, we follow the standards of JPA queries in the construction of the
> name of the function call. But replacing find by select, and adding the
> entity after (not before) the select keyword.
> [here](https://docs.spring.io/spring-data/jpa/docs/1.5.0.RELEASE/reference/html/jpa.repositories.html);

#### Example

```javascript
// src/store/views/selectors.js
import { createSelector } from "reselect";

/* … */

// An auxiliary selector to get the name inside options
function selectOptionsName(mainState, { name }) {
  return name;
}

export function makeSelectViewsByNameLike() {
  return createSelector(selectViews, selectOptionsName, (views, name) => {
    // like lamdas? try: return views.filter((view) => view.name.includes(name));
    const result = [];
    for (let i = 0; i < views.length; i += 1) {
      const view = views[i];
      if (view.name.includes(name)) result.push(view);
    }
    return result;
  });
}

// a memoized selector that uses other memoized selector
export function makeCountViewsByNameLike() {
  const selectViewsByNameLike = makeSelectViewsByNameLike();
  return createSelector(selectViewsByNameLike, (views) => {
    return views.length;
  });
}
```

### When to use Memoization?

Use memoization when:

- The result is not a primitive
- The result is not a part of the state
- The result is costly to compute
- The result is a new object or array