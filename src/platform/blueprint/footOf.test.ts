import { describe, expect, it } from "vitest";
import { footOf } from "./footOf";

describe("the line at a node's foot", () => {
  it("says what came out, or why nothing did", () => {
    expect(footOf({ state: "done", inputs: {}, outputs: {}, settled: {}, said: "420 rows", key: [] }, "x")).toEqual({ said: "420 rows", trouble: false });
    expect(footOf({ state: "failed", inputs: {}, message: "y: the table has no column rain", key: [] }, "x")).toEqual({ said: "y: the table has no column rain", trouble: true });
    expect(footOf({ state: "waiting", path: "/data/a.json" }, "x").said).toBe("fetching its data…");
    expect(footOf({ state: "blocked", by: "heat" }, "x").said).toBe("waits for heat");
    expect(footOf({ state: "missing", pins: ["table"] }, "x")).toEqual({ said: "wire or write: table", trouble: true });
    expect(footOf({ state: "unknown" }, "teleport")).toEqual({ said: "there is no kind of node called teleport", trouble: true });
    expect(footOf(undefined, "x").said).toBe("");
  });
});
