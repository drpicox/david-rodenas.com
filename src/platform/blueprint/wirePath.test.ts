import { describe, expect, it } from "vitest";
import { wirePath } from "./wirePath";

describe("the curve a wire is drawn along", () => {
  it("leaves its output going right and reaches its input coming from the left, bending halfway", () => {
    expect(wirePath({ x: 0, y: 0 }, { x: 200, y: 100 })).toBe("M0 0 C100 0 100 100 200 100");
  });

  it("swings out wide when the input stands behind the output, rather than doubling back on itself", () => {
    expect(wirePath({ x: 100, y: 0 }, { x: 60, y: 30 })).toBe("M100 0 C160 0 0 30 60 30");
  });

  it("rounds to a tenth, which no screen can tell apart", () => {
    expect(wirePath({ x: 0.123, y: 0 }, { x: 100.456, y: 0 })).toBe("M0.1 0 C60.1 0 40.5 0 100.5 0");
  });
});
