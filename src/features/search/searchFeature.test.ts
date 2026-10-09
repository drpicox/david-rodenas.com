import { describe, expect, it } from "vitest";
import { searchCommand } from "./searchCommand";
import { searchFeature } from "./searchFeature";
import { searchFlag } from "./searchFlag";

describe("search, as the site has it", () => {
  it("brings the command to every reader, and three ways of asking it behind one flag with a choice each", () => {
    expect(searchFeature.commands).toEqual([searchCommand]);
    expect(searchFeature.flags).toEqual([searchFlag]);
    expect([searchFlag.name, searchFlag.choices]).toEqual(["search", ["prompt", "header", "palette"]]);
    expect(searchFeature.install).toBeTypeOf("function");
  });
});
