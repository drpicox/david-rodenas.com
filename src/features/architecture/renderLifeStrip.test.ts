import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { renderLifeStrip } from "./renderLifeStrip";

const life: Life = { id: 0, path: "a.ts", lines: 1, test: false, typesOnly: false, born: 2, changed: [4, 7] };

describe("a file's life on a line", () => {
  it("draws the line from where it was written to the commit shown, a dot where it was written and a mark for each change", () => {
    const strip = renderLifeStrip(life, 10, 10);
    expect(strip.match(/<line class="change"/g)).toHaveLength(2);
    expect(strip).toContain('<circle class="written"');
    expect(strip).toMatch(/<line class="lived" x1="[\d.]+" x2="297\.0"/);
  });
});
