import { describe, expect, it } from "vitest";
import { searchCommand } from "./searchCommand";
import { searchFeature } from "./searchFeature";

describe("search, as the site has it", () => {
  it("brings the command, and puts the search on every page, for every reader, with no flag to switch it on", () => {
    expect(searchFeature.commands).toEqual([searchCommand]);
    expect(searchFeature.flags).toBeUndefined();
    expect(searchFeature.install).toBeTypeOf("function");
  });
});
