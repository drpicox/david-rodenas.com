import { describe, expect, it } from "vitest";
import { conduitPath } from "./conduitPath";

describe("a conduit, drawn through the points it turns at", () => {
  it("is one straight line between two modules level with each other", () => {
    expect(conduitPath([{ x: 0, y: 10 }, { x: 100, y: 10 }], 8)).toBe("M0 10 L100 10");
  });

  it("turns each corner on a curve as wide as asked", () => {
    expect(conduitPath([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 40 }, { x: 90, y: 40 }], 8)).toBe("M0 0 L42 0 Q50 0 50 8 L50 32 Q50 40 58 40 L90 40");
  });

  it("takes a curve that fits where a step is too short for the one asked", () => {
    expect(conduitPath([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 6 }, { x: 100, y: 6 }], 8)).toBe("M0 0 L47 0 Q50 0 50 3 Q50 6 53 6 L100 6");
  });

  it("goes straight through a point it does not turn at, and through one said twice", () => {
    expect(conduitPath([{ x: 0, y: 5 }, { x: 40, y: 5 }, { x: 40, y: 5 }, { x: 80, y: 5 }], 8)).toBe("M0 5 L80 5");
  });

  it("is nothing for a conduit with nowhere to go", () => {
    expect(conduitPath([{ x: 3, y: 3 }], 8)).toBe("");
  });
});
