import { describe, expect, it } from "vitest";
import { bandOf } from "./bandOf";

describe("the band a box stands in", () => {
  it("is the frame for a folder of the frame, the features for a feature, and src for a file at the top", () => {
    expect(["platform/shell", "features/rocket", "features/allFeatures.ts", "main.ts"].map(bandOf)).toEqual(["platform", "features", "features", "src"]);
  });
});
