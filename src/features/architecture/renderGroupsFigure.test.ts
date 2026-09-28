import { describe, expect, it } from "vitest";
import { renderGroupsFigure } from "./renderGroupsFigure";
import type { Snapshot } from "./Snapshot";

const file = (id: number, path: string) => ({ id, path, lines: 1, test: false });
// A feature's three files and the frame file only they use; another feature of three on its own; one file alone.
const snapshot: Snapshot = {
  modules: [file(0, "features/f/a.ts"), file(1, "features/f/b.ts"), file(2, "features/f/c.ts"), file(3, "platform/m/m.ts"), file(4, "features/g/d.ts"), file(5, "features/g/e.ts"), file(6, "features/g/h.ts"), file(7, "platform/lone/l.ts")],
  dependencies: [
    { from: 0, to: 1, typeOnly: false }, { from: 1, to: 2, typeOnly: false }, { from: 2, to: 0, typeOnly: false }, { from: 0, to: 3, typeOnly: false }, { from: 1, to: 3, typeOnly: false },
    { from: 4, to: 5, typeOnly: false }, { from: 5, to: 6, typeOnly: false }, { from: 6, to: 4, typeOnly: false },
  ],
};
const groups = new Map([[0, 0], [1, 0], [2, 0], [3, 0], [4, 1], [5, 1], [6, 1], [7, 2]]);

describe("the figure of the groups the arrows make", () => {
  const figure = renderGroupsFigure(snapshot, groups);

  it("draws each group of three files or more as a bar of its boxes, the biggest first, and says what is in it", () => {
    expect([...figure.matchAll(/<text class="group"[^>]*>([^<]+)</g)].map(([, text]) => text)).toEqual(["4 files: f 3, m 1", "3 files: g 3"]);
    expect(figure.match(/<rect class="part frame"/g)).toHaveLength(1);
    expect(figure.match(/<rect class="part feature"/g)).toHaveLength(2);
  });

  it("says how many groups there are, how many are a single box, and the modularity of the boxes against the groups'", () => {
    expect(figure).toContain("into 3 groups");
    expect(figure).toContain("1 of the 2 features is a group to itself: all of its files, and nothing else");
    expect(figure).toMatch(/Drawn as the boxes say, the source has a modularity of 0\.\d+; drawn as the arrows would, 0\.\d+/);
  });
});
