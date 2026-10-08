import { describe, expect, it } from "vitest";
import { barcelonaAnswer } from "./barcelonaAnswer";
import { monthlyMeansOf } from "./monthlyMeansOf";

const TWELVE = [6.7, 7.3, 11.6, 11.4, 16.3, 19.1, 21.4, 22, 20.3, 16.3, 9.2, 7.3];

describe("Barcelona's series, as the Meteocat serves it", () => {
  it("is read a year a row, the mean temperature of each month from January to December", () => {
    expect(monthlyMeansOf(barcelonaAnswer({ 1780: TWELVE, 1781: TWELVE }))).toEqual(new Map([[1780, TWELVE], [1781, TWELVE]]));
  });

  it("has nothing for a month the Meteocat has no value for", () => {
    expect(monthlyMeansOf(barcelonaAnswer({ 1786: [null, null, ...TWELVE.slice(2)] })).get(1786)?.slice(0, 3)).toEqual([null, null, 11.6]);
  });

  it("refuses what is not the series, a row that is not a year of twelve months, and a year twice, rather than guess", () => {
    expect(() => monthlyMeansOf("<html><body>Not found</body></html>")).toThrow(/not the series/);
    expect(() => monthlyMeansOf(barcelonaAnswer({ 1780: TWELVE.slice(0, 11) }))).toThrow(/1780 has 11 months/);
    expect(() => monthlyMeansOf(`${barcelonaAnswer({ 1780: TWELVE })}1780\t${TWELVE.join("\t")}\r\n`)).toThrow(/1780 twice/);
  });
});
