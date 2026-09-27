import { describe, expect, it } from "vitest";
import { reachedByTests } from "./reachedByTests";

describe("the files the tests reach", () => {
  it("are the ones some test imports directly, and never a test", () => {
    const snapshot = {
      modules: [
        { id: 0, path: "a.ts", lines: 1, test: false },
        { id: 1, path: "b.ts", lines: 1, test: false },
        { id: 2, path: "a.test.ts", lines: 1, test: true },
        { id: 3, path: "helper.test.ts", lines: 1, test: true },
      ],
      dependencies: [
        { from: 2, to: 0, typeOnly: false },
        { from: 2, to: 3, typeOnly: false },
        { from: 0, to: 1, typeOnly: false },
      ],
    };
    expect([...reachedByTests(snapshot)]).toEqual([0]);
  });
});
