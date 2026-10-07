import { describe, expect, it } from "vitest";
import { inOrderOf } from "./inOrderOf";

describe("the names a column holds, in order", () => {
  it("are in the column's own order, what it does not name after the rest as the rows first hold them, and once each", () => {
    const season = { name: "season", kind: "text" as const, order: ["winter", "spring", "summer", "autumn"] };
    expect(inOrderOf(season, ["autumn", "dry", "summer", "winter", "wet", "summer"])).toEqual(["winter", "summer", "autumn", "dry", "wet"]);
  });

  it("are as the rows first hold them, when the column gives no order", () => {
    expect(inOrderOf({ name: "station", kind: "text" }, ["X4", "WU", "X4"])).toEqual(["X4", "WU"]);
  });
});
