import { describe, expect, it } from "vitest";
import { againstStabilityOf } from "./againstStabilityOf";
import type { BoxStability } from "./stabilityOf";

const box = (name: string, instability: number | null): BoxStability => ({ box: name, files: 1, neededBy: 1, needs: 1, instability, abstractness: 0, changes: 0 });
const boxes = [box("platform/a", 0.25), box("platform/b", 0.75), box("features/f", 1), box("features/lone", null)];

describe("the arrows that go against stability", () => {
  it("are the box arrows from a box to a less stable one, as many files as they join, the steepest first", () => {
    const links = [
      { from: "features/f", to: "platform/a", count: 3 },
      { from: "platform/a", to: "platform/b", count: 2 },
      { from: "platform/b", to: "features/f", count: 1 },
      { from: "features/lone", to: "platform/a", count: 1 },
    ];
    expect(againstStabilityOf(links, boxes)).toEqual([
      { from: "platform/a", to: "platform/b", count: 2, rise: 0.5 },
      { from: "platform/b", to: "features/f", count: 1, rise: 0.25 },
    ]);
  });
});
