import { describe, expect, it } from "vitest";
import { describeWay } from "./describeWay";
import { growMaze } from "./growMaze";

describe("what the page says about the way out", () => {
  it("counts the rooms walked and the spheres touched", () => {
    expect(describeWay(growMaze(7, 7, 543))).toBe("The way out is 19 rooms long, and touches no sphere.");
  });

  it("says so when a dead sphere has cut the way out off", () => {
    const lost = Array.from({ length: 50 }, (_, seed) => growMaze(7, 7, seed)).find((maze) => describeWay(maze).startsWith("There is no way out"));
    expect(lost).toBeDefined();
  });
});
