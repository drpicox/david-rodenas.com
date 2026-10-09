import { describe, expect, it } from "vitest";
import { flagsInAddress } from "./flagsInAddress";

const FLAGS = [{ name: "portfolio", description: "" }, { name: "loud", description: "" }];

describe("the flags a link asks for", () => {
  it("are the flags named in its query, on or off", () => {
    expect(flagsInAddress(FLAGS, "?portfolio=on&loud=off")).toEqual({ portfolio: true, loud: false });
  });

  it("are, for a flag with choices, the one chosen on and every other off, or all of them off", () => {
    const search = [{ name: "search", description: "", choices: ["prompt", "header", "palette"] }];
    expect(flagsInAddress(search, "?search=header")).toEqual({ "search=prompt": false, "search=header": true, "search=palette": false });
    expect(flagsInAddress(search, "?search=off")).toEqual({ "search=prompt": false, "search=header": false, "search=palette": false });
    expect(flagsInAddress(search, "?search=on")).toEqual({});
  });

  it("leave out what is not a flag, and what is neither on nor off", () => {
    expect(flagsInAddress(FLAGS, "?utm_source=x&portfolio=yes&loud=on")).toEqual({ loud: true });
  });
});
