import { describe, expect, it } from "vitest";
import { highlight } from "../highlight";
import { renderSlides } from "./renderSlides";

describe("slides, as the page carries them before any script", () => {
  const html = renderSlides(["let a = 1;", "--- red Expected: 2. Received: 1.", "let a = 2;", "--- green All tests pass."].join("\n"), "js");

  it("holds every frame, coloured as code, each with what was said of it", () => {
    expect(html.match(/<div class="slide( current)?">/g)).toHaveLength(2);
    expect(html).toContain(`<pre><code>${highlight("let a = 1;", "js")}</code></pre>`);
    expect(html).toContain('<p class="slide-status red">Expected: 2. Received: 1.</p>');
    expect(html).toContain('<p class="slide-status green">All tests pass.</p>');
  });

  it("shows the last frame, the one the slides end on, and says which language they are in", () => {
    expect(html).toMatch(/^<figure class="slides" data-language="js">/);
    expect(html).toMatch(/<div class="slide current"><pre><code>[^]*2[^]*<\/code><\/pre><p class="slide-status green">/);
  });
});
