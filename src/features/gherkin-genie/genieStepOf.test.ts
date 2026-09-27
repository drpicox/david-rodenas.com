import { describe, expect, it } from "vitest";
import { genieStepOf } from "./genieStepOf";

describe("a sentence read the way Gherkin Genie reads it", () => {
  it("names the step by its words, each one capitalised", () => {
    expect(genieStepOf("I am running a Gherkin test")).toEqual({ matchName: "IAmRunningAGherkinTest", args: [] });
  });

  it("takes a number out as an argument, and leaves an N in its place", () => {
    expect(genieStepOf("I have 12 cucumbers")).toEqual({ matchName: "IHaveNCucumbers", args: [12] });
  });

  it("takes a quoted string out, spaces and all, and leaves an S", () => {
    expect(genieStepOf('"John" likes color "Red"')).toEqual({ matchName: "SLikesColorS", args: ["John", "Red"] });
    expect(genieStepOf('I say "hello world" twice')).toEqual({ matchName: "ISaySTwice", args: ["hello world"] });
    expect(genieStepOf('I have 3 "apples" in 2 "carts"')).toEqual({ matchName: "IHaveNSInNS", args: [3, "apples", 2, "carts"] });
    expect(genieStepOf("it says 'it\\'s' out loud")).toEqual({ matchName: "ItSaysSOutLoud", args: ["it's"] });
  });

  it("keeps only the letters of a word, without accents, and lowercases the rest of it", () => {
    expect(genieStepOf("the HTTP status should be 200")).toEqual({ matchName: "TheHttpStatusShouldBeN", args: [200] });
    expect(genieStepOf("I order a café")).toEqual({ matchName: "IOrderACafe", args: [] });
  });

  it("passes on as it is what has no letters at all, and leaves an X", () => {
    expect(genieStepOf("it costs $15 €")).toEqual({ matchName: "ItCostsXX", args: ["$15", "€"] });
  });
});
