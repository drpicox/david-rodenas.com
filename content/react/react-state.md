---
title: React State
tags:
  - react
  - state
  - redux
---

# React State

## Finding the State

There is an obvious true, usually forgotten: all views are derived from the
state. It does not matter what there are in the state, where is the state, or
how we handle it, but all views derive from it.

![State is Everywhere](/images/view/StateIsEveryWhere.png)

Some times this is not obvious because the state of the view is hidden. Hidden
in variables inside the classes, hidden in form data, even hidden as pixels on
the screen. But once you understand that you can control all the states, then
you can control any view.

## The source of truth

Imagine that you have one single source of truth. A place from where all the
things derive. All content of the database, all content of the models, all
intermediate variables from controllers, all small bits of memory spread across
views.

![Single Source of Truth](/images/view/StateSingleSourceOfTruth.png)

It does not matter if it is real or just a logic representation in your head,
but it opens a new perspective. Now you know everything inside your program.
Everything that means something and somehow represents something, is inside that
single source of truth.

## Even the pointer has state

And then you can realize something very simple: the view itself is created from
that state. Everything that you can see on the screen exists to represent
something inside that.

![Cursor and State](/images/view/TheStateOfTheCursor.png)

Even that little thing, the pointer of your mouse, responds to that principle.
Probably you do not care about that, it is a very low level concept and you only
need clicks and the operating system handles it, but somehow, the state is here.
Two small integers, x and y describes its position on the screen.

These two integers exists in the memory of your computer, they are the source of
truth for the position of the your pointer. When you move the cursor, some thing
awakes inside your computer, gets the movement, and saves the new position in
those x and y. And later, some other process reads those variables and paints
the cursor on the screen.

The cursor is drawn in the position in which is drawn because there is where its
x and y says to draw it. The state mandates the view.

## View is a function of the state

This is the most pure way of conceive the view, and the most powerful too. Views
are not complex things to create or maintain, they are the simple conclusion of
computing the whole state of your application.

![f(state) = view](/images/view/ViewIsFunction-wide.jpg)

### Stepping through view

Let's start with a simple shopping application. Some users, some products, a
cart, the current user, the current view, all of them are state. And the view
shows them.

![State-View-001](/images/view/ViewAndState-001.png)

### Change current user

What means changing the current user? It is changing the state of the current
user. Imagine that we change to the user `u2`. It changes the salute, the amount
of items in the cart, and even the possibility of buying more.

![State-View-002](/images/view/ViewAndState-002.png)

If the view shows that is in the state, we can forget about touching anything
else but the state. The view will update itself.

### Change the current view

Yes. The url in the browser is also part of the state. It is one record more in
our concept of unified state of all the things. And if you change what is
writing in the memory position of the current url, the view updates to show the
current view.

So if we want to show the page of the product `p1`, we just change that in the
currentView state, and suddenly the view mutates to show the product page with
all the details.

![State-View-003](/images/view/ViewAndState-003.png)

### Going to the cart

It is one more change of the currentView state. We write that the current view
is the cart, and the view computes the new view that it is the cart.

![State-View-004](/images/view/ViewAndState-004.png)

### Changing user

We can go back the to `u1` by changing the currentUser again. And the new view
computed from the unified state is the cart, but now with the three items of the
current user. And the view computed itself automatically.

![State-View-005](/images/view/ViewAndState-005.png)

### And changing prices

We do not care if we are in the catalog, or in the product view, or in the cart.
We just change the value in the state of the price of one product, and
everything updates. Even the total value of the cart.

![State-View-006](/images/view/ViewAndState-006.png)

### Closing the loop

And if we return to the cart, just changing the state for the currentView, we
can check that the catalog is updated by itself.

![State-View-007](/images/view/ViewAndState-007.png)

## Our state is Redux

Instead of having a miscellanea of states spread across multiple components,
abstractions, and levels, we have decided to have a single source of truth. A
place in which we can select everything that we need.

Usually that place has been databases, but databases are slow for UI and we need
some intermediate memory which can destroy the single source of truth. So we
need to choose a fast memory to query all the state. We use redux.

The Redux store becomes our source of truth.

![Redux Overview](/images/redux/redux-overview-minimal.png)

We dispatch actions that will mutate the state, and we read the conclusion. And
we will paint views as a result of a function with React.

```json
{
  "users": [
    { "id": "u1", "name": "mary" },
    { "id": "u2", "name": "john" }
  ],
  "products": [{ "id": "p1", "name": "oranges", "price": 0.95 }],
  "carts": [{ "id": "c1", "user": "u1" }],
  "cartLines": [{ "cart": "c1", "product": "p1", "quantity": 3 }],
  "currentUser": "u1",
  "currentView": "/cart"
}
```