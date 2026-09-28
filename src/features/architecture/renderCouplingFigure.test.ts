import { describe, expect, it } from "vitest";
import { renderCouplingFigure } from "./renderCouplingFigure";
import type { Snapshot } from "./Snapshot";

const file = (id: number, path: string) => ({ id, path, lines: 1, test: false });
const needs = (from: number, to: number) => ({ from, to, typeOnly: false });
// platform/p: three files needed by three features, two of its files needing three frame boxes; platform/solo needs nothing and nothing needs it.
const snapshot: Snapshot = {
  modules: [
    file(0, "platform/p/a.ts"), file(1, "platform/p/b.ts"), file(2, "platform/p/c.ts"),
    file(3, "features/f/f.ts"), file(4, "features/g/g.ts"), file(5, "features/h/h.ts"),
    file(6, "platform/q/q.ts"), file(7, "platform/r/r.ts"), file(8, "platform/s/s.ts"),
    file(9, "platform/solo/solo.ts"),
  ],
  dependencies: [needs(3, 0), needs(4, 0), needs(5, 1), needs(1, 6), needs(2, 7), needs(2, 8)],
};

describe("the figure of a box's two couplings", () => {
  const figure = renderCouplingFigure(snapshot, "platform/p");

  it("draws each box that needs it on one side and each box it needs on the other, what needs it coming in, what it needs going out", () => {
    expect([...figure.matchAll(/<text class="coupled in"[^>]*>([^<]+)</g)].map(([, text]) => text)).toEqual(["features/f · 1 file", "features/g · 1 file", "features/h · 1 file"]);
    expect([...figure.matchAll(/<text class="coupled out"[^>]*>([^<]+)</g)].map(([, text]) => text)).toEqual(["platform/q · 1 file", "platform/r · 1 file", "platform/s · 1 file"]);
    expect(figure.match(/<path class="arrow in"/g)).toHaveLength(3);
    expect(figure.match(/<path class="arrow out"/g)).toHaveLength(3);
  });

  it("marks, among its files, the ones that need something elsewhere", () => {
    expect(figure.match(/<circle class="file needing"/g)).toHaveLength(2);
    expect(figure.match(/<circle class="file"/g)).toHaveLength(1);
  });

  it("works the instability out under it, with the numbers", () => {
    expect(figure).toContain("Ca = 3");
    expect(figure).toContain("Ce = 2");
    expect(figure).toContain("I = Ce / (Ca + Ce) = 2 / (3 + 2) = 0.4");
  });

  it("takes, when no box is named, one that both needs and is needed, the nearest to half way", () => {
    expect(renderCouplingFigure(snapshot)).toContain('data-box="platform/p"');
  });
});
