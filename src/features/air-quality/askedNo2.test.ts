import { describe, expect, it } from "vitest";
import { askedNo2 } from "./askedNo2";

describe("what an agent asks of the NO2 measurements, as the page's own selection", () => {
  it("is every day at the first station, every year it has, when nothing is said", () => {
    expect(askedNo2({})).toEqual({ codes: ["08019004"], days: "all" });
  });

  it("takes the years, a month and an hour of the table, said as numbers or as words for numbers", () => {
    expect(askedNo2({ station: "08019043", days: "workdays", from: "2015", to: 2020, month: 11, hour: 9 })).toEqual({ codes: ["08019043"], days: "workdays", from: 2015, to: 2020, month: 11, hour: 9 });
  });

  it("is every station when asked for all", () => {
    expect(askedNo2({ station: "all" })).toMatchObject({ codes: expect.arrayContaining(["08019004", "08137001"]) });
    expect(askedNo2({ station: "all" })).toHaveProperty("codes.length", 11);
  });

  it("refuses a year that is not one", () => {
    expect(askedNo2({ from: 2015.5 })).toEqual({ refused: "from: 2015.5 is not a year" });
  });
});
