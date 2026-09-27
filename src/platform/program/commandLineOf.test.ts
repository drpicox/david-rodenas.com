import { describe, expect, it } from "vitest";
import { aProgram } from "./aProgram";
import { commandLineOf } from "./commandLineOf";

describe("the line that would have asked for what the dials show", () => {
  it("is the bare name while nothing has moved", () => {
    expect(commandLineOf(aProgram, { sum: 100, rate: 10, years: 2, paid: "once a year" })).toBe("savings");
  });

  it("names only what moved, in the program's order", () => {
    expect(commandLineOf(aProgram, { sum: 100, rate: 4.5, years: 30, paid: "once a year" })).toBe("savings --rate 4.5 --years 30");
  });

  it("writes a choice as a word", () => {
    expect(commandLineOf(aProgram, { sum: 100, rate: 10, years: 2, paid: "every month" })).toBe("savings --paid every-month");
  });

  it("does not print the noise a logarithmic dial leaves in a number", () => {
    expect(commandLineOf(aProgram, { sum: 10 ** 3.3, rate: 10, years: 2, paid: "once a year" })).toBe("savings --sum 1995");
  });
});
