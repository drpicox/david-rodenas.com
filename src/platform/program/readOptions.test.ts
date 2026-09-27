import { describe, expect, it } from "vitest";
import { readOptions } from "./readOptions";

describe("the options on a command line", () => {
  it("reads --name value", () => {
    expect(readOptions(["--rate", "5", "--years", "3"])).toEqual({ given: { rate: "5", years: "3" } });
  });

  it("reads --name=value", () => {
    expect(readOptions(["--rate=5"])).toEqual({ given: { rate: "5" } });
  });

  it("is asked for help", () => {
    expect(readOptions(["--rate", "5", "--help"])).toEqual({ help: true });
  });

  it("refuses an option with nothing after it", () => {
    expect(readOptions(["--rate"])).toEqual({ error: "--rate needs a value" });
  });

  it("refuses a word that is not an option", () => {
    expect(readOptions(["rate", "5"])).toEqual({ error: "rate: options are written --name value" });
  });
});
