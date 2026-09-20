import { describe, expect, it } from "vitest";
import { questionInWords } from "./questionInWords";

const ALL = Array.from({ length: 12 }, (_, month) => month);

describe("the question, said out loud", () => {
  it("names the variable, the side and the threshold with its unit", () => {
    expect(questionInWords({ variable: "tn", atLeast: true, threshold: 20, months: ALL })).toBe("days with a daily minimum of 20 °C or more, whole year");
    expect(questionInWords({ variable: "tn", atLeast: false, threshold: 0, months: ALL })).toBe("days with a daily minimum below 0 °C, whole year");
    expect(questionInWords({ variable: "pi", atLeast: true, threshold: 12.5, months: ALL })).toBe("days with most rain in one hour of 12.5 mm/h or more, whole year");
  });

  it("says which months when it is not all of them", () => {
    expect(questionInWords({ variable: "tx", atLeast: true, threshold: 30, months: [5, 6, 7] })).toBe("days with a daily maximum of 30 °C or more, June to August");
  });
});
