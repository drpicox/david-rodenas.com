import { describe, expect, it } from "vitest";
import { gridAnswerOf } from "./gridAnswerOf";
import { seaAnswer } from "./seaAnswer";

describe("what the sea's server answers, read", () => {
  it("is a value a day, a latitude and a longitude, with the days counted from 1800, and land as nothing", () => {
    const grid = gridAnswerOf(seaAnswer(2025, 0, 2, (day, lat, lon) => (lon < 1 ? null : day + lat / 100 + lon / 1000)));
    expect(grid.times).toEqual([82180, 82181]);
    expect(grid.lats).toHaveLength(7);
    expect(grid.lons[6]).toBe(2.375);
    expect(grid.values[1]?.[3]?.[6]).toBeCloseTo(1 + 41.375 / 100 + 2.375 / 1000, 9);
    expect(grid.values[0]?.[0]?.[0]).toBeNull();
  });

  it("throws, in its words, what the server says when it refuses", () => {
    expect(() => gridAnswerOf('Error {\n    code = 3;\n    message = "Bad Projection Request: stop >= size: 300:278";\n};')).toThrow("Bad Projection Request: stop >= size: 300:278");
  });
});
