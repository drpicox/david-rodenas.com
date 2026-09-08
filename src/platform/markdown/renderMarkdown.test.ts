import { describe, expect, it } from "vitest";
import { renderMarkdown, slugOf } from "./renderMarkdown";

describe("slugOf", () => {
  it("makes an id a link can point at", () => {
    expect(slugOf("Five times")).toBe("five-times");
  });

  it("survives accents", () => {
    expect(slugOf("Què faig")).toBe("que-faig");
  });
});

describe("renderMarkdown", () => {
  it("turns a blank line into a new block", () => {
    expect(renderMarkdown("one\n\ntwo")).toBe("<p>one</p>\n<p>two</p>");
  });

  it("joins the lines of one paragraph", () => {
    expect(renderMarkdown("one\ntwo")).toBe("<p>one two</p>");
  });

  it("gives every heading an id", () => {
    expect(renderMarkdown("## Five times")).toBe('<h2 id="five-times">Five times</h2>');
  });

  it("lets a heading break where it asks to, and keeps one id for the whole", () => {
    expect(renderMarkdown("# I lay  \nthe foundations")).toBe('<h1 id="i-lay-the-foundations">I lay<br>the foundations</h1>');
  });

  it("does not read a heading into the paragraph under it", () => {
    expect(renderMarkdown("# Title\nwords")).toBe("<p># Title words</p>");
  });

  it("keeps a fenced block verbatim, blank lines and all", () => {
    expect(renderMarkdown("```\na\n\nb\n```")).toBe("<pre><code>a\n\nb</code></pre>");
  });

  it("reads no markup inside a fenced block", () => {
    expect(renderMarkdown("```\n**a** <b>\n```")).toBe("<pre><code>**a** &lt;b&gt;</code></pre>");
  });

  it("makes bulleted and numbered lists", () => {
    expect(renderMarkdown("- a\n- b")).toBe("<ul><li>a</li><li>b</li></ul>");
    expect(renderMarkdown("1. a\n2. b")).toBe("<ol><li>a</li><li>b</li></ol>");
  });

  it("reads `term :: definition` as a definition list", () => {
    expect(renderMarkdown("2014 :: Desigual")).toBe("<dl><dt>2014</dt><dd>Desigual</dd></dl>");
  });

  it("joins a quote into one blockquote", () => {
    expect(renderMarkdown("> a\n> b")).toBe("<blockquote>a b</blockquote>");
  });

  it("makes a rule", () => {
    expect(renderMarkdown("---")).toBe("<hr>");
  });
});

describe("an app block", () => {
  it("leaves a named place for a program to mount into", () => {
    expect(renderMarkdown("::technical-debt")).toBe('<div class="app" data-app="technical-debt"></div>');
  });

  it("is only a line that is nothing but the name", () => {
    expect(renderMarkdown("::not an app")).toBe("<p>::not an app</p>");
  });
});

describe("an image on its own", () => {
  it("is a figure, not a paragraph, so it can stand centred while an inline one floats", () => {
    expect(renderMarkdown("![The cover](/c.jpeg)")).toBe('<figure><img src="/c.jpeg" alt="The cover"></figure>');
    expect(renderMarkdown("![The cover](/c.jpeg) beside words")).toMatch(/^<p><img /);
  });
});

describe("a list item over several lines", () => {
  it("continues on an indented line, and breaks where asked", () => {
    expect(renderMarkdown("- [A](/a/)  \n  what A is\n- B")).toBe('<ul><li><a href="/a/">A</a><br>what A is</li><li>B</li></ul>');
  });

  it("breaks a paragraph too", () => {
    expect(renderMarkdown("first  \nsecond")).toBe("<p>first<br>second</p>");
  });
});

describe("a loose list", () => {
  it("is one list even with blank lines between its items", () => {
    expect(renderMarkdown("- a\n\n- b\n\n- c")).toBe("<ul><li>a</li><li>b</li><li>c</li></ul>");
    expect(renderMarkdown("- a  \n  more a\n\n- b")).toBe("<ul><li>a<br>more a</li><li>b</li></ul>");
  });

  it("ends where something that is not an item begins", () => {
    expect(renderMarkdown("- a\n\nAfter.")).toBe("<ul><li>a</li></ul>\n<p>After.</p>");
  });
});

describe("space", () => {
  it("is a line of backslashes: one paragraph's height per backslash", () => {
    expect(renderMarkdown("a\n\n\\\n\nb")).toBe('<p>a</p>\n<div class="space" style="--n:1"></div>\n<p>b</p>');
    expect(renderMarkdown("\\\\\\")).toBe('<div class="space" style="--n:3"></div>');
  });

  it("keeps a sized image a figure", () => {
    expect(renderMarkdown('![c](/c.jpeg "wide")')).toBe('<figure><img src="/c.jpeg" alt="c" class="wide"></figure>');
  });

describe("a fenced block's language", () => {
  it("colours the block by the language its fence names", () => {
    expect(renderMarkdown("```js\nreturn 1\n```")).toBe(
      '<pre><code><span class="hl-k">return</span> <span class="hl-n">1</span></code></pre>',
    );
  });

  it("leaves a fence with no language plain, box characters and all", () => {
    expect(renderMarkdown("```\n┌─┐ <b>\n```")).toBe("<pre><code>┌─┐ &lt;b&gt;</code></pre>");
  });
});
});
