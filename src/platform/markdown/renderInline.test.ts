import { describe, expect, it } from "vitest";
import { renderInline } from "./renderInline";

describe("renderInline", () => {
  it("escapes what only looks like markup", () => {
    expect(renderInline("2 < 3 & <b>")).toBe("2 &lt; 3 &amp; &lt;b&gt;");
  });

  it("keeps a code span as code", () => {
    expect(renderInline("call `a < b` now")).toBe("call <code>a &lt; b</code> now");
  });

  it("reads no markup inside a code span", () => {
    expect(renderInline("`**not bold**`")).toBe("<code>**not bold**</code>");
  });

  it("does not confuse a digit in the text with a code span", () => {
    expect(renderInline("22 packages, `396` releases")).toBe("22 packages, <code>396</code> releases");
  });

  it("links, and sends what leaves the site to its own tab", () => {
    expect(renderInline("[here](/work/)")).toBe('<a href="/work/">here</a>');
    expect(renderInline("[npm](https://npmjs.com)")).toContain('target="_blank"');
  });

  it("does bold and italic", () => {
    expect(renderInline("**a** and *b*")).toBe("<strong>a</strong> and <em>b</em>");
  });

  // A link is one thing, so a code span inside its label must not cut it in half.
  it("reads a code span inside a link's label", () => {
    expect(renderInline("[`compile.js`](/code/)")).toBe('<a href="/code/"><code>compile.js</code></a>');
    expect(renderInline("read [the `ngRef` directive](/code/) now")).toBe(
      'read <a href="/code/">the <code>ngRef</code> directive</a> now',
    );
  });

  it("marks up a link's label like any other words", () => {
    expect(renderInline("[**loud**](/a/)")).toBe('<a href="/a/"><strong>loud</strong></a>');
  });

  // A code span is still stronger than a link: what is inside it is not markup.
  it("reads no link inside a code span", () => {
    expect(renderInline("`[a](/b/)`")).toBe("<code>[a](/b/)</code>");
  });

  // The reason there are two passes: the marks are read after the links, not before.
  it("lets emphasis hold a link inside it", () => {
    expect(renderInline("*see [the page](/code/) first*")).toBe(
      '<em>see <a href="/code/">the page</a> first</em>',
    );
  });

  it("escapes an address once, not twice", () => {
    expect(renderInline("[q](https://example.com/?a=1&b=2)")).toContain('href="https://example.com/?a=1&amp;b=2"');
  });
});

describe("renderInline images", () => {
  it("places an image, with its words for whoever cannot see it", () => {
    expect(renderInline("![The cover](/book/cover.jpeg)")).toBe('<img src="/book/cover.jpeg" alt="The cover">');
  });

  it("does not mistake an image for a link", () => {
    expect(renderInline("![c](/a.png)")).not.toContain("<a ");
  });
});

describe("the em dash", () => {
  it("takes a pair of hyphens between spaces", () => {
    expect(renderInline("a -- b")).toBe("a — b");
  });

  // A paragraph is wrapped in the source, so half of them land at the end of a line.
  it("takes one that the line wrapped away from its second space", () => {
    expect(renderInline("a --\nb")).toBe("a — b");
  });

  it("leaves a hyphenated word alone", () => {
    expect(renderInline("deep-watching")).toBe("deep-watching");
  });
});

describe("line breaks", () => {
  it("breaks the line where two trailing spaces ask for it, and joins it otherwise", () => {
    expect(renderInline("title  \nsubtitle")).toBe("title<br>subtitle");
    expect(renderInline("one\ntwo")).toBe("one two");
  });
});

describe("image sizes", () => {
  it("takes a size from the image's title: large or wide", () => {
    expect(renderInline('![c](/c.jpeg "large")')).toBe('<img src="/c.jpeg" alt="c" class="large">');
    expect(renderInline('![c](/c.jpeg "wide")')).toBe('<img src="/c.jpeg" alt="c" class="wide">');
  });

  it("ignores a title that is not a size", () => {
    expect(renderInline('![c](/c.jpeg "the cover")')).toBe('<img src="/c.jpeg" alt="c">');
  });
});
