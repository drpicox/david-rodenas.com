import { describe, expect, it } from "vitest";
import { KATA_STEPS } from "./KATA_STEPS";
import { renderKataStep } from "./renderKataStep";
import { renderKataStrip } from "./renderKataStrip";

const at = (commit: number) => KATA_STEPS[commit]!;

describe("the kata's rhythm, at a glance", () => {
  const strip = renderKataStrip(KATA_STEPS, 17);

  it("is one cell a commit, numbered, red or green as the tests ran, and marked by its move", () => {
    expect(strip.match(/<li /g)).toHaveLength(42);
    expect(strip).toContain('<li class="red test" data-commit="1"');
    expect(strip).toContain('<li class="green code" data-commit="2"');
    expect(strip).toContain('<li class="green clean" data-commit="10"');
    expect(strip).toMatch(/data-commit="17"[^>]*>17<\/li>/);
  });

  it("says what its colours mean", () => {
    expect(strip).toContain('<span class="red">a test fails</span>');
    expect(strip).toContain('<span class="green code">all pass</span>');
    expect(strip).toContain('<span class="green clean">a clean step: all still pass</span>');
  });

  it("marks the commit being shown, and names each cell for a reader who cannot see the colours", () => {
    expect(strip).toMatch(/<li class="red test here" data-commit="17"[^>]*aria-current="step"/);
    expect(strip).toContain('title="commit 17 · test · Expected: 16. Received: 13."');
  });
});

describe("one commit of the kata", () => {
  it("names the move and leaves the outcome to the bar: setting a test aside is a test step, and green", () => {
    const html = renderKataStep(at(18), at(17));
    expect(html).toContain("Test: write or change a test");
    expect(html).toContain('<p class="kata-bar green">');
  });

  it("says which commit and which move, and what the tests said", () => {
    const html = renderKataStep(at(17), at(16));
    expect(html).toContain("commit 17");
    expect(html).toContain('<p class="kata-bar red">Expected: 16. Received: 13.</p>');
    expect(renderKataStep(at(16), at(15))).toContain('<p class="kata-bar green">All tests pass.</p>');
  });

  it("shows both files, with the lines this commit changed marked", () => {
    const html = renderKataStep(at(17), at(16));
    expect(html).toContain("bowling.spec.js");
    expect(html).toContain("bowling.js");
    expect(html).toMatch(/<span class="line added">[^\n]*one spare/);
    expect(html).not.toMatch(/<span class="line added">[^\n]*all ones/);
  });

  it("lists the smells still to clean, and the slide's own note", () => {
    const html = renderKataStep(at(18), at(17));
    expect(html).toContain("<li>ugly comment in test.</li>");
    expect(html).toContain("Responsibilities are misplaced.");
  });

  it("says, at the start, that the test file is there but empty, and the code not written yet", () => {
    const html = renderKataStep(at(0));
    expect(html).toContain('<figcaption>bowling.spec.js</figcaption><p class="kata-empty">An empty file.</p>');
    expect(html).toContain('<figcaption>bowling.js</figcaption><p class="kata-empty">Not written yet.</p>');
  });
});
