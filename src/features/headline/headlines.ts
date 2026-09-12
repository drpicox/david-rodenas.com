import type { Headline } from "./Headline";

/**
 * What the headline turns into, one at a time, after it has said what it
 * says. Every line here is already on the home page in longer form and is
 * verified there; this list adds no claim, it only shortens ones. Each is
 * three lines, like the headline it replaces, so the heading keeps its
 * height with no line left empty; no line is longer than twenty-five
 * characters, the longest line of that headline, so none wraps where it did
 * not. Where the site has a page for it, the headline leads there.
 */
export const HEADLINES: readonly Headline[] = [
  { text: "More than\nhalf a million views\non Medium.", href: "/essays/" },
  { text: "One essay\nevery Saturday\nsince 2022.", href: "/essays/" },
  { text: "I made\nthe AngularJS compiler\nfaster.", href: "/code/" },
  { text: "Two public APIs\nof AngularJS\nare mine.", href: "/code/" },
  { text: "I wrote a book\non technical debt\nand its emotional cost.", href: "/book/" },
  { text: "Never rewrite,\nnever stop delivery:\nthe book's one rule.", href: "/book/" },
  { text: "The world above\nwas grown\nas this page opened.", href: "/worlds/" },
];
