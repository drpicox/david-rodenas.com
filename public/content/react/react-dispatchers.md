---
title: React Dispatchers
tags:
  - react
  - redux
  - dispatch
---

# React Dispatchers

## Dispatch without hassle

Select the state is difficult. You have to observe the state, select what you
want, make sure that you keep everything efficient, ...

But dispatch is easy. You do not have result, thus you cannot look what
happened. You do not have to update views, so no extra queries for the state are
needed. Just call dispatch.

And to get dispatch, use the `useDispatch`. And then use the dispatch as
classical redux dispatch.

```jsx
import React, { useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { newsAdded } from "../store/news/actions";

export function AddNews() {
  const dispatch = useDispatch();
  const nameRef = useRef();
  const add = useCallback(() => {
    const name = nameRef.current.value;

    dispatch(newsAdded(name));
  });

  return (
    <div>
      Name: <input ref={nameRef} />
      <br />
      <button onClick={add}>Add</button>
    </div>
  );
}
```