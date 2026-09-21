import { describe, expect, it } from "vitest";
import { renderBars } from "./renderBars";
import { renderMarkdown } from "./renderMarkdown";

const source = `times faster than one thread
= 1 :: one thread
where it started :: 0.77
a lock of its own :: 0.36 !
a lock for each line :: 4.39 | 4.4, once tuned`;

describe("a few numbers, drawn where they are written", () => {
  const html = renderBars(source);

  it("is a row for each line, with the number in the page and a bar as long as the number is large", () => {
    expect(html.match(/<tr/g)).toHaveLength(3);
    expect(html).toMatch(/where it started<\/th>.*--p:0\.175.*>0\.77</s);
    expect(html).toMatch(/a lock for each line<\/th>.*--p:1(\.000)?"/s);
  });

  it("lets a line say its number in its own words", () => {
    expect(html).toContain(">4.4, once tuned<");
  });

  it("marks the line that is the point", () => {
    expect(html).toMatch(/<tr class="marked">\s*<th scope="row">a lock of its own/);
  });

  it("rules a value every bar is held against, and says what it is", () => {
    expect(html).toContain("--rule:0.228");
    expect(html).toContain("one thread");
  });

  it("says what the numbers are", () => {
    expect(html).toContain("<figcaption>times faster than one thread");
  });

  it("is what a fence named bars becomes", () => {
    expect(renderMarkdown("```bars\na :: 1\nb :: 2\n```")).toContain('<figure class="bars">');
  });

  it("does not let a label break the page", () => {
    expect(renderBars("a <b> :: 1")).toContain("a &lt;b&gt;");
  });
});
