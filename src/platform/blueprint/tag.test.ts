import { describe, expect, it } from "vitest";
import { tag } from "./tag";

describe("markup made by tag, which is safe to put in a page", () => {
  it("writes an element, its attributes and its children", () => {
    expect(tag("svg", { viewBox: "0 0 10 10", role: "img" }, tag("circle", { cx: 5, cy: 5, r: 2 })).html).toBe('<svg viewBox="0 0 10 10" role="img"><circle cx="5" cy="5" r="2"></circle></svg>');
  });

  it("escapes words, in children and in attributes, so a station's name cannot become markup", () => {
    expect(tag("text", { "aria-label": 'a "quote"' }, "<b> & co").html).toBe('<text aria-label="a &quot;quote&quot;">&lt;b&gt; &amp; co</text>');
  });

  it("leaves out an attribute that is not there, and writes one that is only true bare", () => {
    expect(tag("input", { hidden: true, disabled: false, title: undefined, value: null }).html).toBe("<input hidden></input>");
  });

  it("takes lists of children, as a map over rows gives them, and says numbers as words", () => {
    expect(tag("g", {}, [1, 2].map((n) => tag("rect", { width: n })), 3, null, false).html).toBe('<g><rect width="1"></rect><rect width="2"></rect>3</g>');
  });

  it("takes lists of lists, as a map that gives two elements a row does", () => {
    expect(tag("g", {}, [1, 2].map((n) => [tag("line", { x: n }), tag("text", {}, n)])).html).toBe('<g><line x="1"></line><text>1</text><line x="2"></line><text>2</text></g>');
  });
});
