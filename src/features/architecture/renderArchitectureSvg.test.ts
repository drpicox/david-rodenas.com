import { describe, expect, it } from "vitest";
import type { Layout } from "./Layout";
import { renderArchitectureSvg } from "./renderArchitectureSvg";

const layout: Layout = {
  width: 300,
  height: 200,
  bands: [{ name: "features", x: 4, y: 2, width: 290, height: 60 }],
  boxes: [
    { name: "features/rocket", label: "rocket", x: 10, y: 10, width: 80, height: 40, rank: 1, cyclic: false },
    { name: "platform/program", label: "program", x: 10, y: 120, width: 80, height: 40, rank: 0, cyclic: false },
    { name: "platform/shell", label: "shell", x: 120, y: 120, width: 80, height: 40, rank: 0, cyclic: true },
  ],
  balls: [{ id: 7, path: "features/rocket/voyage.ts", box: "features/rocket", x: 30, y: 30, radius: 4, test: false, typesOnly: false }],
  links: [
    { from: "features/rocket", to: "platform/program", count: 3, typeOnly: true, x1: 36.7, y1: 50, x2: 50, y2: 120 },
    { from: "features/rocket", to: "platform/shell", count: 1, typeOnly: false, x1: 63.3, y1: 50, x2: 160, y2: 120 },
  ],
};

describe("the picture of the architecture, as the HTML carries it", () => {
  const svg = renderArchitectureSvg(layout);

  it("is an SVG the size of the layout, that says what it shows", () => {
    expect(svg).toMatch(/^<svg class="architecture" viewBox="0 0 300 200" role="img" aria-label="3 boxes, 1 files, 2 arrows between boxes">/);
  });

  it("labels every box, and marks the ones caught in a circle", () => {
    expect(svg).toContain(">rocket</text>");
    expect(svg).toMatch(/<g class="box cyclic"[^>]*data-box="platform\/shell"/);
  });

  it("names every file on hover", () => {
    expect(svg).toContain("<title>features/rocket/voyage.ts</title>");
  });

  it("gives every arrow a head, from the bottom of the box that needs to the top of the one needed, and draws one onto an interface apart", () => {
    expect(svg).toContain('marker-end="url(#arrowhead)"');
    expect(svg).toMatch(/<path class="link type-only"[^>]*d="M36.7 50 C/);
    expect(svg).toMatch(/<path class="link"[^>]*d="M63.3 50 C[^"]* 160 120"/);
  });

  it("draws the box around each level, named", () => {
    expect(svg).toMatch(/<g class="band" data-band="features"><rect x="4" y="2" width="290" height="60"[^>]*\/><text[^>]*>features<\/text>/);
  });
});
