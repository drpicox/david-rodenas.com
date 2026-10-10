import { describe, expect, it } from "vitest";
import type { Found } from "./pagesFound";
import { renderFound } from "./renderFound";

const found: Found[] = [
  { route: "/projects/hot-nights/", title: "Hot nights, counted", summary: "How many nights never cool.", section: "projects", line: "A torrid night is one at 25 °C or more." },
  { route: "/", title: "Home", summary: "", section: "", line: "Nights <and> days." },
];

describe("the pages found, as the header prints them", () => {
  it("are a path to follow, what it is after a #, and the line that says the words, marked", () => {
    const html = renderFound(found, ["night"]);
    expect(html).toContain('<a href="/projects/hot-nights/">projects/hot-nights/</a><span class="hint"> # Hot nights, counted</span>');
    expect(html).toContain('<span class="said">A torrid <mark>night</mark> is one at 25 °C or more.</span>');
  });

  it("name the home as ls names it, and escape what a line says", () => {
    const html = renderFound(found, ["night"]);
    expect(html).toContain('<a href="/">README.md</a>');
    expect(html).toContain("<mark>Night</mark>s &lt;and&gt; days.");
  });

  it("say how many more there are past the most they show, and that there are none when there are none", () => {
    expect(renderFound(found, ["night"], 1)).toContain('<p class="more">1 more. Another word narrows it.</p>');
    expect(renderFound([], ["snow"])).toBe('<p class="none">No page says that.</p>');
  });
});
