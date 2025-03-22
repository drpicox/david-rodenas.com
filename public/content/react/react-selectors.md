---
title: React Selectors
tags:
  - react
  - redux
  - selectors
---

# React Selectors

## Reading from the State

The simplest way to read something from the state is read it with `useSelector`:

```jsx
import { React } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/currentUser/selectors";

export function HelloCurrentUser() {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <div style={{ textDecoration: "underscore" }}>
      Hello {currentUser.name}!
    </div>
  );
}
```

The useSelector goes to the redux store, registers itself as observer, reads the
state, can calls to the selector function with it.

Each time that the state updates, `useSelect` gets the state again, calls to the
select function, and, if the result is different tells react to repaint the
component.

And that is why we have to return memoized or stable results, because if we
return a different result each time that we call to the select function, it will
rerender the component and loose the lazy performance.

## Using memoized selectors

Memoized selectors are behind make selectors. Each use of useSelector for a
memoized selectors needs its own select function. Remember that createSelector
memoized functions only remembers the last call.

So as first step, we need to make a new select function to call, and for that we
will use the `useMemo` function from react.

```jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { makeSelectTopNews } from "../store/news/selectors";

export function ListTopNews() {
  const selectTopNews = useMemo(makeSelectTopNews, []);
  const topNews = useSelector(selectTopNews);

  return (
    <ul>
      {topNews.map((row) => (
        <li key={row.id}>{row.title}</li>
      ))}
    </ul>
  );
}
```

> **Important**: remember always to add `[]` at the end of the `useMemo`. If
> you forget it, useMemo will not work and will create a new selector each
> time, disabling the memoizing capacities.

## Using props

Selectors like react components have props. The `useSelector` has no direct use
of props, but, it allows to create a small select function to use it.

```jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { makeSelectNewsByNameLike } from "../store/news/selectors";

export function ListNewsByNameLike({ name }) {
  const selectNewsByNameLike = useMemo(makeSelectNewsByNameLike, []);
  const fewNews = useSelector((state) => selectNewsByNameLike(state, { name }));

  return (
    <ul>
      {fewNews.map((row) => (
        <li key={row.id}>{row.title}</li>
      ))}
    </ul>
  );
}
```