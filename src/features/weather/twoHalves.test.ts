import { describe, expect, it } from "vitest";
import { twoHalves } from "./twoHalves";

const year = (label: number, days: number, whole = true) => ({ year: label, days, whole, summary: days / 10 });

describe("the record cut in two, to see whether it has moved", () => {
  it("compares the mean of the first half of the whole years with the mean of the second", () => {
    const halves = twoHalves([year(2018, 10), year(2019, 20), year(2020, 40), year(2021, 50)]);
    expect(halves).toEqual([
      { from: 2018, to: 2019, years: 2, days: 15, summary: 1.5 },
      { from: 2020, to: 2021, years: 2, days: 45, summary: 4.5 },
    ]);
  });

  it("never lets a year with holes in it into either mean", () => {
    const halves = twoHalves([year(2017, 999, false), year(2018, 10), year(2019, 20), year(2020, 40), year(2021, 50)]);
    expect(halves?.[0]).toMatchObject({ from: 2018, days: 15 });
  });

  it("gives the odd year to the later half", () => {
    const halves = twoHalves([year(2017, 10), year(2018, 10), year(2019, 20), year(2020, 40), year(2021, 50)]);
    expect(halves?.map((half) => half.years)).toEqual([2, 3]);
  });

  it("says nothing when there are too few whole years for a half to mean anything", () => {
    expect(twoHalves([year(2019, 20), year(2020, 40), year(2021, 50)])).toBeNull();
  });
});
