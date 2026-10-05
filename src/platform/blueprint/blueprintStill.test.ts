import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import { blueprintStill } from "./blueprintStill";

describe("a blueprint written in a page, before any script", () => {
  const still = blueprintStill(aKit)(() => "", [], 'n = nights\nbars "Nights a year" table: n');

  it("shows its board, run at build time", () => {
    expect(still).toContain('<div class="bp-board">');
    expect(still).toContain("<figcaption>Nights a year</figcaption>");
  });

  it("draws the blueprint under it, tidied when its text does not say where the nodes stand", () => {
    expect(still).toContain('<svg class="bp-diagram"');
    expect(still).toContain("The blueprint: 2 nodes and 1 wires.");
  });

  it("writes it out as text, to be read or copied", () => {
    expect(still).toContain("<summary>The blueprint as text</summary><pre><code>n = nights\nbars &quot;Nights a year&quot; table: n</code></pre>");
  });
});
