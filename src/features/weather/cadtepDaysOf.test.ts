import { describe, expect, it } from "vitest";
import { cadtepAnswer } from "./cadtepAnswer";
import { cadtepDaysOf } from "./cadtepDaysOf";

describe("a long series, as the Meteocat serves it", () => {
  it("is read a day a row: its rain, its highest temperature and its lowest", () => {
    const days = cadtepDaysOf(cadtepAnswer("OBSERVATORI FABRA", [["1950-01-01", 0, 13.1, 7.1], ["1950-01-02", 2.5, 12, 6.4]]));
    expect(days).toEqual([
      { date: "1950-01-01", pp: 0, tx: 13.1, tn: 7.1 },
      { date: "1950-01-02", pp: 2.5, tx: 12, tn: 6.4 },
    ]);
  });

  it("finds its columns by their names, whether the hours of sun follow them or not, and whatever ends its lines", () => {
    const sunny = cadtepAnswer("OBSERVATORI FABRA", [["2025-12-31", 0, 12.2, 5.6]], true).replaceAll("\n", "\r\n");
    expect(cadtepDaysOf(sunny)).toEqual([{ date: "2025-12-31", pp: 0, tx: 12.2, tn: 5.6 }]);
  });

  it("leaves out a value it has not got, and keeps the rest of the day", () => {
    const text = cadtepAnswer("GRANOLLERS", [["1950-01-01", 0.5, 12.4, 6.4]]).replace("\t12.4\t", "\t-999.9\t");
    expect(cadtepDaysOf(text)).toEqual([{ date: "1950-01-01", pp: 0.5, tx: null, tn: 6.4 }]);
  });

  it("refuses what is not a series, a day twice, and days out of order, rather than guess", () => {
    expect(() => cadtepDaysOf("<html><body>Not found</body></html>")).toThrow(/not a series/);
    expect(() => cadtepDaysOf(cadtepAnswer("GIRONA", [["1950-01-01", 0, 10, 2], ["1950-01-01", 0, 11, 3]]))).toThrow(/1950-01-01 twice/);
    expect(() => cadtepDaysOf(cadtepAnswer("GIRONA", [["1950-01-02", 0, 10, 2], ["1950-01-01", 0, 11, 3]]))).toThrow(/out of order/);
  });
});
