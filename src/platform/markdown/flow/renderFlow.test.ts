import { describe, expect, it } from "vitest";
import { renderFlow } from "./renderFlow";

describe("renderFlow", () => {
  const svg = renderFlow("A[post.md] -->|compiles| B[Post_Test.java]\nB --> C[apiCalls <json>]");

  it("draws an svg the page can hold, sized by its content and never wider than the column", () => {
    expect(svg).toMatch(/^<figure class="flow"><svg /);
    expect(svg).toContain('class="flow"');
    expect(svg).toMatch(/viewBox="0 0 \d+(\.\d+)? \d+(\.\d+)?"/);
    expect(svg).toContain("max-width: 100%");
  });

  it("writes every label, escaped", () => {
    expect(svg).toContain("post.md");
    expect(svg).toContain("Post_Test.java");
    expect(svg).toContain("apiCalls &lt;json&gt;");
    expect(svg).not.toContain("<json>");
  });

  it("draws one arrow per edge, with a head, and the edge's label on it", () => {
    expect(svg.match(/<path class="edge"/g)).toHaveLength(2);
    expect(svg).toContain("<marker");
    expect(svg.match(/marker-end="url\(#arrow-[a-z0-9]+\)"/g)).toHaveLength(2);
    expect(svg).toContain('class="edge-label"');
    expect(svg).toContain("compiles");
  });

  it("breaks a two-line label into two lines of text", () => {
    const two = renderFlow("A[first\\nsecond] --> B");
    expect(two.match(/<tspan/g)).toHaveLength(3);
  });

  // Two diagrams on one page must not share an arrowhead definition, or the second borrows the first's.
  it("gives each diagram its own arrowhead", () => {
    const one = renderFlow("A --> B").match(/id="(arrow-[a-z0-9]+)"/)?.[1];
    const other = renderFlow("C --> D").match(/id="(arrow-[a-z0-9]+)"/)?.[1];
    expect(one).toBeDefined();
    expect(one).not.toBe(other);
  });
});
