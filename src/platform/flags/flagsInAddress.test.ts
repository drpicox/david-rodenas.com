import { describe, expect, it } from "vitest";
import { flagsInAddress } from "./flagsInAddress";

const FLAGS = [{ name: "portfolio", description: "" }, { name: "loud", description: "" }];

describe("the flags a link asks for", () => {
  it("are the flags named in its query, on or off", () => {
    expect(flagsInAddress(FLAGS, "?portfolio=on&loud=off")).toEqual({ portfolio: true, loud: false });
  });

  it("leave out what is not a flag, and what is neither on nor off", () => {
    expect(flagsInAddress(FLAGS, "?utm_source=x&portfolio=yes&loud=on")).toEqual({ loud: true });
  });
});
