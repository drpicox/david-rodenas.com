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
