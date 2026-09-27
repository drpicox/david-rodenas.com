import { describe, expect, it } from "vitest";
import { metricsOf } from "./metricsOf";

const snapshot = {
  modules: [
    { id: 0, path: "platform/p/a.ts", lines: 10, test: false },
    { id: 1, path: "platform/q/b.ts", lines: 20, test: false },
    { id: 2, path: "features/f/c.ts", lines: 30, test: false },
    { id: 4, path: "features/f/Shape.ts", lines: 5, test: false, typesOnly: true },
    { id: 3, path: "features/f/c.test.ts", lines: 5, test: true },
  ],
  dependencies: [
    { from: 2, to: 0, typeOnly: false },
    { from: 0, to: 1, typeOnly: true },
    { from: 1, to: 0, typeOnly: false },
    { from: 3, to: 2, typeOnly: false },
  ],
};

describe("what a snapshot measures", () => {
  it("counts the files that ship apart from the tests, and their lines", () => {
    expect(metricsOf(snapshot)).toMatchObject({ files: 4, tests: 1, lines: 65, boxes: 3 });
  });

  it("counts the arrows that ship, those that cross boxes, and those that need only a type", () => {
    expect(metricsOf(snapshot)).toMatchObject({ arrows: 3, crossing: 3, typeOnly: 1 });
  });

  it("counts the boxes caught in a circle", () => {
    expect(metricsOf(snapshot).inCycles).toBe(2);
  });

  it("counts the files a test reaches directly, out of those with something in them to test", () => {
    expect(metricsOf(snapshot)).toMatchObject({ testable: 3, tested: 1 });
  });
});
