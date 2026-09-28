import { describe, expect, it } from "vitest";
import { radiiBy } from "./radiiBy";

const snapshot = {
  modules: [
    { id: 1, path: "platform/a.ts", lines: 10, test: false },
    { id: 2, path: "platform/b.ts", lines: 400, test: false },
    { id: 3, path: "features/c.ts", lines: 10, test: false },
  ],
  dependencies: [
    { from: 2, to: 1 },
    { from: 3, to: 1 },
    { from: 3, to: 2 },
  ],
};

describe("how big a ball is drawn", () => {
  it("by what needs it: the file most needed is the biggest, whatever its lines", () => {
    const radii = radiiBy(snapshot as never, "neededBy");
    expect(radii?.get(1)).toBeGreaterThan(radii?.get(2) ?? Infinity);
    expect(radii?.get(2)).toBeGreaterThan(radii?.get(3) ?? Infinity);
  });

  it("by what it needs, the other way round", () => {
    const radii = radiiBy(snapshot as never, "needs");
    expect(radii?.get(3)).toBeGreaterThan(radii?.get(2) ?? Infinity);
    expect(radii?.get(2)).toBeGreaterThan(radii?.get(1) ?? Infinity);
  });

  it("by the commits that changed it so far, on the scale of the most changed file at the end, so that a ball only grows as the history plays", () => {
    const early = radiiBy(snapshot as never, "changes", { counts: new Map([[1, 1]]), most: 4 });
    const late = radiiBy(snapshot as never, "changes", { counts: new Map([[1, 4], [2, 1]]), most: 4 });
    expect(early?.get(1)).toBeLessThan(late?.get(1) ?? 0);
    expect(late?.get(1)).toBeGreaterThan(late?.get(2) ?? Infinity);
    expect(late?.get(2)).toBeGreaterThan(late?.get(3) ?? Infinity);
  });

  it("by its lines, which is the layout's own size and needs nothing more", () => {
    expect(radiiBy(snapshot as never, "lines")).toBeNull();
  });
});
