import { describe, expect, it } from "vitest";
import { recipesFeature } from "./recipesFeature";

describe("the bigger nodes, on trial", () => {
  it("are offered only under the flag the feature declares, which no reader has on unless they switch it on", () => {
    const [flag] = recipesFeature.flags ?? [];
    expect(flag).toMatchObject({ name: "recipes" });
    expect(flag?.trial).toBeUndefined();
    expect(recipesFeature.nodes?.map((kind) => [kind.name, kind.flag])).toEqual([
      ["cross", "recipes"],
      ["day-parts", "recipes"],
    ]);
  });
});
