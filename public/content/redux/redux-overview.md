---
title: Redux Overview
tags:
  - redux
  - overview
---

# Redux Overview

What is Redux in a high glance?

## Application state and databases

![Redux as Database](/images/redux/redux-database.png)

All applications need to manage an state, but not all applications have access
to a disk and to a database safely. Moreover, applications may have multiple
views interacting with the same data and all must be consistent.

Redux is like a Database in memory. It helps to manage all the state that is
accessible by all parts of the applications, and coordinate them.

## Redux Language

![Redux Overview](/images/redux/redux-overview-minimal.png)

Redux has its own language to specify each part:

- Updates are done through **actions**
- Queries are done through **selectors**
- The data stored is the **state**
- The engine is the **reducer**

The **Store** is the object who actually manages the state and changes. It has
two main methods:

- **dispatch(action)**: the store executes the action, and consequently update
  the data.
- **getState():State**: retrieves all the data inside the store

## Overview

![Redux Overview](/images/redux/redux-overview.png)

- **Redux is** a very simple library. It is basically **the Store class** that
  extends Observable and keeps track of changes of its state.

- Each action that arrives to the dispatch method, is passed to a pure
  functional function called **reduce**, which given the current state and the
  action, computes the next state.

- The Store **notifies** when the state **changes** by firing update.

- It **keeps the state**, which can be accessed by getState.

- Everything is designed to **work with plain JSON objects**, that can be
  serialized and send through network.

- **Our task** as developers using Redux is to create multiple reducers that
  will combine into a single reducer, define the actions, and create the queries
  that would filter the state to obtain more advanced data.

### CQS: Command Query Separation

![Command Query Separation](/images/redux/cqs.png)

It is a pattern that divides the object methods into two categories:

- **queries**: return a result and do not change the _observable_ state (has no
  side effects or aka is pure functional)
- **commands**: changes the state of the object, but returns nothing

#### Example of non-CQS stack

```javascript
// Non-CQS stack
export class NonSqsStack {
  #list = [];

  push(value) {
    this.#list.push(value);
  }

  pop() {
    return this.#list.pop();
  }
}
```

#### Example of a CQS stack

```javascript
// CQS stack
export class CqsStack {
  #list = [];

  push(value) {
    this.#list.push(value);
  }

  pop() {
    this.#list.pop();
  }

  top() {
    return this.#list[this.#list.length - 1];
  }
}
```

#### Redux is CQS

Redux satisfies the CQS:

- dispatch is a command method
- getState is a query command

Like the CqsStack, the only way to know the result of dispatching an action is
getting the state.