---
title: "React Function"
user: "drpicox"
---

# React Function

## React for PHP programmers

React was conceived by Facebook as a way to take advantage of their already well
trained PHP programmers.

PHP is nothing else than a very big print function. When a user clicks one link
and lands into a page, the PHP knows nothing but the url and the cookies. With
this information, PHP goes to the database, reads all kind of important data,
and prints it to the screen.

```php
<?php
  $news = readNewsFromDatabase();
  echo "<ul>";
  for($i = 0, $size = count($news); $i < $size; ++$i) {
    $row = $news[i];
    echo "<li>".$row->title."</li>";
  }
  echo "</ul>";
?>
```

Every time that you land on a website, it repaints everything. It does not care
about changes, new news added, titles updated, ... nothing. And it makes things
very easy. One simple algorithm paints everything.

## React is a function

React is like PHP. Instead of printing something to the webpage, it returns what
has to paint. And, when something changes in the state, React components returns
once again everything to paint.

```jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectNews } from "../store/news/selectors";

export function ListNews() {
  const news = useSelector(selectNews);

  return (
    <ul>
      {news.map((row) => (
        <li key={row.id}>{row.title}</li>
      ))}
    </ul>
  );
}
```

It is just a pure function, what it receives, it paints. It does not care if a
new is added, or if a title is changed, it just shows everything like the old
fashioned PHP web page.

## React components are functions

And because of it, it turns out that React components are functions that returns
pieces of html.

```javascript
import React from "react";

export function HelloWorld() {
  return <div>Hello world!</div>;
}
```

### You can call other components like html components.

Just import what you want to use, and use it.

```javascript
import React from "react";
import { HelloWorld } from "./HelloWorld";

export function SayHelloWorld() {
  return (
    <div>
      I say: <br />
      <HelloWorld />
    </div>
  );
}
```

> **Important**: Component names always start with a capital letter, html dom
> elements always start with a lower case letter.

### And components, have props, like function has arguments

React function components have one and only one argument, and object with all
the properties. Just get the ones that you need.

```javascript
import React from "react";

export function SayHello({ name }) {
  return <div>Hello {name}</div>;
}

export function SayHelloData() {
  const name = "data";

  return (
    <div>
      Data says: <SayHello name={name} />
    </div>
  );
}
```

### And children prop

There is one special property called _children_, it contains all the content
inside the component.

```javascript
import React from "react";

export function Box({ children }) {
  return (
    <div style={{ padding: "1em", border: "solid 1px black" }}>{children}</div>
  );
}

export function SayHello() {
  const name = "data";

  return <Box>Hello World!</Box>;
}
```

## JSX

It looks weird seeing plain code having pieces of html. That is not javascript
but an extension. But it is not strange, there are libraries for many libraries
that do that for many purposes. For example HostedSQL mixed SQL and C++.

In this case, we have a compiler called Babel that transforms those strange
constructs of html into plain objects.

```javascript
// before translation
const div = <div style={{ background: "yellow" }}>Hello World!</div>;

// after translation
const div = React.createElement(
  "div",
  { style: { background: "yellow" } },
  "Hello World!"
);
```

But we do not need to care about it. In fact we can forget it. The only
important point is to remember that all weird html content mixed in javascript
are nothing else than an object. You can play with the translator
[here](https://babeljs.io/repl/#?browsers=Chrome%2080&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=MYewdgzgLgBAJgSwG4wLwwDyJdAngGwFNUBvEmAIwENgBrAcwCcQBXMOALhgCJdD98IAO7cYAXzEA-ABL9BMAOohG-OAEIMAemySA3EA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=true&sourceType=module&lineWrap=true&presets=env%2Creact&prettier=true&targets=&version=7.14.4&externalPlugins=).

## React is lazy

If you are observant, you can see that you can use React components in two
different ways:

```javascript
import React from "react";

export function SayHello({ name }) {
  return <div>Hello {name}</div>;
}

export function LazySayHelloData() {
  const name = "data";

  return (
    <div>
      Data says: <SayHello name={name} />
    </div>
  );
}

export function ImperativeSayHelloData() {
  const name = "data";

  return <div>Data says: {SayHello({ name })}</div>;
}
```

Both shows exactly the same view. Both work correctly. May be `<SayHello>` is
more clear. But that is not the important thing. The main difference between
`<SayHello>` and `SayHello()`, is that the first is lazy and the second is
imperative.

The Lazy version only updates when there is a change, and only executes when
React needs to know how to repaint something. But the imperative one always
calls to SayHello, and it is executed each time.

That is not a problem in small UI, but this is a major problem in large views.
We leverage on react implementation of Lazy functional paradigm to create large
an efficient views without effort.