import { describe, expect, it } from "vitest";
import type { Found } from "./pagesFound";
import { renderFound } from "./renderFound";

const found: Found[] = [
  { route: "/projects/hot-nights/", title: "Hot nights, counted", summary: "How many nights never cool.", section: "projects", line: "A torrid night is one at 25 °C or more." },
  { route: "/", title: "Home", summary: "", section: "", line: "Nights <and> days." },
];

describe("the pages found, drawn", () => {
  it("as the header lists them: a path to follow, what it is after a #, and the line that says the words", () => {
    const html = renderFound(found, ["night"], "lines");
    expect(html).toContain('<a href="/projects/hot-nights/">projects/hot-nights/</a><span class="hint"> # Hot nights, counted</span>');
    expect(html).toContain('<span class="said">A torrid <mark>night</mark> is one at 25 °C or more.</span>');
    expect(html).toContain('<a href="/">README.md</a>');
  });

  it("as a palette shows them: the section, the title, and the line, the whole of it one thing to follow", () => {
    const html = renderFound(found, ["night"], "cards");
    expect(html).toContain('<a class="card" href="/projects/hot-nights/"><span class="where">projects</span><strong>Hot nights, counted</strong><span class="said">A torrid <mark>night</mark> is one at 25 °C or more.</span></a>');
    expect(html).toContain("<mark>Night</mark>s &lt;and&gt; days.");
  });

  it("says how many more there are past the most it shows, and that there are none when there are none", () => {
    expect(renderFound(found, ["night"], "cards", 1)).toContain('<p class="more">1 more. Another word narrows it.</p>');
    expect(renderFound([], ["snow"], "lines")).toBe('<p class="none">No page says that.</p>');
  });
});
