import { describe, expect, it } from "vitest";
import { renderStabilityFigure } from "./renderStabilityFigure";
import type { BoxStability } from "./stabilityOf";

const box = (name: string, instability: number | null, abstractness: number, files: number, changes: number): BoxStability => ({ box: name, files, neededBy: 3, needs: 1, instability, abstractness, changes });
const boxes = [
  box("platform/markdown", 0, 0, 10, 20),
  box("platform/random", 0, 0, 1, 0),
  box("platform/plugin", 0.1, 0.2, 5, 10),
  box("features/rocket", 0.8, 0.1, 16, 7),
  box("main.ts", 1, 0, 1, 11),
  box("features/lone", null, 0, 2, 0),
];

describe("the figure of how stable each box is, and how often it changed", () => {
  const figure = renderStabilityFigure(boxes);
  const dots = new Map([...figure.matchAll(/<circle class="box" data-box="([^"]+)" cx="([\d.]+)" cy="([\d.]+)"[^>]*style="--v:([\d.]+)"/g)].map(([, name, cx, cy, v]) => [name, { cx: Number(cx), cy: Number(cy), v: Number(v) }]));
  const at = (name: string) => dots.get(name) ?? { cx: NaN, cy: NaN, v: NaN };

  it("places every box that needs or is needed by its instability across and its abstractness up", () => {
    expect([...dots.keys()].sort()).toEqual(["features/rocket", "main.ts", "platform/markdown", "platform/plugin", "platform/random"]);
    expect(at("platform/markdown").cx).toBeLessThan(at("platform/plugin").cx);
    expect(at("platform/plugin").cx).toBeLessThan(at("features/rocket").cx);
    expect(at("features/rocket").cx).toBeLessThan(at("main.ts").cx);
    expect(at("platform/plugin").cy).toBeLessThan(at("platform/markdown").cy);
  });

  it("colours a box by how often its files changed, one for one", () => {
    expect(at("platform/markdown").v).toBeGreaterThan(at("platform/random").v);
  });

  it("draws the main sequence, and the zones of pain and of uselessness either side of it", () => {
    expect(figure).toContain('class="sequence"');
    expect(figure).toContain('class="zone pain"');
    expect(figure).toContain('class="zone useless"');
  });

  it("names the boxes in the zone of pain that change, the most changed first, and leaves out the ones there that never did", () => {
    expect(figure).toContain("3 boxes stand in the zone of pain. The ones there that have changed, the most first: platform/markdown (2 changes a file) and platform/plugin (2).");
  });

  it("has every box's figures in a table", () => {
    expect(figure.match(/<tr><td><code>/g)).toHaveLength(6);
  });
});
