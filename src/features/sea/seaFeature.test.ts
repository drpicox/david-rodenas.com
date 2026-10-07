import { describe, expect, it } from "vitest";
import { seaFeature } from "./seaFeature";
import { seaSource } from "./seaSource";

describe("the sea, as the site keeps it", () => {
  it("brings the open data it keeps, and its points as the sources of a blueprint", () => {
    expect(seaFeature.sources).toEqual([seaSource]);
    expect(seaFeature.nodes?.map((kind) => kind.name)).toEqual(["sea-months", "sea-years", "sea-days", "sea-points"]);
    expect(seaFeature.nodes?.every((kind) => kind.shelf === "Sea")).toBe(true);
  });
});
