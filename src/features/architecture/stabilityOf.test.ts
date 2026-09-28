import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import type { Snapshot } from "./Snapshot";
import { stabilityOf } from "./stabilityOf";

// A frame box of two files, one of them only types; two features that need it; the composition root that needs them; and a test.
const snapshot: Snapshot = {
  modules: [
    { id: 0, path: "platform/p/Shape.ts", lines: 5, test: false, typesOnly: true },
    { id: 1, path: "platform/p/draw.ts", lines: 20, test: false },
    { id: 2, path: "features/f/f.ts", lines: 30, test: false },
    { id: 3, path: "features/g/g.ts", lines: 30, test: false },
    { id: 4, path: "main.ts", lines: 10, test: false },
    { id: 5, path: "platform/p/draw.test.ts", lines: 10, test: true },
  ],
  dependencies: [
    { from: 1, to: 0, typeOnly: true },
    { from: 2, to: 1, typeOnly: false },
    { from: 3, to: 0, typeOnly: true },
    { from: 4, to: 2, typeOnly: false },
    { from: 4, to: 3, typeOnly: false },
    { from: 5, to: 1, typeOnly: false },
  ],
};
const life = (id: number, changed: number[]): Life => ({ id, path: "", lines: 0, test: false, typesOnly: false, born: 0, changed });
const lives = [life(0, [3]), life(1, [2, 4, 6]), life(2, [1]), life(3, []), life(4, [1, 2]), life(5, [2, 4, 6])];

describe("each box, measured as Robert C. Martin measures a component", () => {
  const boxes = new Map(stabilityOf(snapshot, lives).map((box) => [box.box, box]));

  it("counts the files elsewhere that need something in it, and its own files that need something elsewhere", () => {
    expect(boxes.get("platform/p")).toMatchObject({ neededBy: 2, needs: 0 });
    expect(boxes.get("features/f")).toMatchObject({ neededBy: 1, needs: 1 });
    expect(boxes.get("main.ts")).toMatchObject({ neededBy: 0, needs: 1 });
  });

  it("is as unstable as it needs and is not needed: the frame is needed and needs nothing, the composition root the other way round", () => {
    expect([...boxes.values()].map(({ box, instability }) => [box, instability])).toEqual([
      ["features/f", 0.5],
      ["features/g", 0.5],
      ["main.ts", 1],
      ["platform/p", 0],
    ]);
  });

  it("is as abstract as the share of its files that are nothing but types", () => {
    expect(boxes.get("platform/p")?.abstractness).toBe(0.5);
    expect(boxes.get("features/f")?.abstractness).toBe(0);
  });

  it("leaves the tests out: a test needs what it tests, and nothing that ships needs a test", () => {
    expect(boxes.get("platform/p")?.files).toBe(2);
  });

  it("adds up the commits that changed the files in it", () => {
    expect(boxes.get("platform/p")?.changes).toBe(4);
    expect(boxes.get("main.ts")?.changes).toBe(2);
  });

  it("has no instability to speak of for a box that neither needs nor is needed", () => {
    const alone = stabilityOf({ modules: [{ id: 0, path: "features/lone/lone.ts", lines: 1, test: false }], dependencies: [] }, []);
    expect(alone[0]?.instability).toBeNull();
  });
});
