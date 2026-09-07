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
