import { describe, expect, it } from "vitest";
import { shapeOf } from "./shapeOf";
import type { Snapshot } from "./Snapshot";

const PATHS = [
  "platform/stable/s.ts",
  "platform/unstable/u.ts",
  "platform/base/x.ts",
  "features/f/f1.ts",
  "features/g/g1.ts",
  "features/allFeatures.ts",
  "main.ts",
  "features/g/g2.ts",
  "platform/unstable/u.test.ts",
  "platform/base/Types.ts",
];
const ARROWS: [number, number][] = [
  [0, 1], // the stable box needs the unstable one: against the rule
  [1, 2],
  [3, 0],
  [4, 0],
  [7, 0],
  [5, 3],
  [5, 4], // the list of features needs a feature less stable than itself: against the rule, and its job
  [6, 5],
  [8, 1], // the test imports u
];
const snapshot: Snapshot = {
  modules: PATHS.map((path, id) => ({ id, path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: path.endsWith("Types.ts") })),
  dependencies: ARROWS.map(([from, to]) => ({ from, to, typeOnly: false })),
};

describe("the shape of the source, as the ratchet holds it", () => {
  const shape = shapeOf(snapshot);

  it("counts the box arrows that go against stability, leaving out the composition, which has to point at every feature", () => {
    expect(shape.againstStability).toBe(1);
  });

  it("measures how deep the knot is and how tall the stack", () => {
    // s, f1, the list and g1 hold one another up two by two; main needs the list, which needs g1, which needs s, which needs u, which needs x.
    expect(shape).toMatchObject({ deepestCore: 2, tallestStack: 5 });
  });

  it("counts the files that ship with something to run that no test imports", () => {
    expect(shape.untested).toBe(7);
  });
});
