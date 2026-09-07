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
});

describe("renderInline images", () => {
  it("places an image, with its words for whoever cannot see it", () => {
    expect(renderInline("![The cover](/book/cover.jpeg)")).toBe('<img src="/book/cover.jpeg" alt="The cover">');
  });

  it("does not mistake an image for a link", () => {
    expect(renderInline("![c](/a.png)")).not.toContain("<a ");
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
