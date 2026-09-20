import { describe, expect, it } from "vitest";
import { weatherSource } from "./weatherSource";

/** A row as the portal answers it. */
function day(station: string, variable: number, date: string, value: number, state: string | undefined = "Representatiu") {
  return { codi_estacio: station, codi_variable: String(variable), data_lectura: `${date}T00:00:00.000`, valor: String(value), ...(state === undefined ? {} : { estat: state }) };
}

const TN = 1002;
const PP = 1300;
const PI = 1303;
const december = day("WU", TN, "2024-12-31", 8);
const yearOf = (rows: unknown[], station = "WU") => weatherSource.withYear({}, 2024, [[...rows, december]])[`${station}.json`]?.years["2024"];

describe("a year of weather, from the portal to the files", () => {
  it("asks once for the year: the chosen stations, the four variables, every day", () => {
    const [url, ...rest] = weatherSource.requestsFor(2024);
    expect(rest).toEqual([]);
    const where = new URL(url ?? "").searchParams.get("$where") ?? "";
    expect(url).toContain("7bvh-jvq2");
    expect(where).toContain("'WU'");
    expect(where).toContain("codi_variable in (1002,1001,1300,1303)");
    expect(where).toContain("'2024-01-01T00:00:00' and '2024-12-31T23:59:59'");
  });

  it("keeps each month as a histogram of its days", () => {
    const year = yearOf([day("WU", TN, "2024-08-01", 25.8), day("WU", TN, "2024-08-02", 25.9), day("WU", TN, "2024-08-03", 24.1)]);
    expect(year?.tn?.months[7]).toEqual([24, 1, 0, 0, 2]);
    expect(year?.tn?.months[6]).toBeNull();
  });

  it("sums a month up the way its variable is summed up: a mean, a total, a peak", () => {
    const year = yearOf([
      day("WU", TN, "2024-08-01", 20),
      day("WU", TN, "2024-08-02", 25),
      day("WU", PP, "2024-08-01", 12.5),
      day("WU", PP, "2024-08-02", 30.1),
      day("WU", PI, "2024-08-01", 8),
      day("WU", PI, "2024-08-02", 22.4),
    ]);
    expect(year?.tn?.summaries[7]).toBe(22.5);
    expect(year?.pp?.summaries[7]).toBe(42.6);
    expect(year?.pi?.summaries[7]).toBe(22.4);
    expect(year?.pp?.summaries[6]).toBeNull();
  });

  it("remembers the highest and the lowest day of the year, with their dates", () => {
    const year = yearOf([day("WU", TN, "2024-08-11", 27.3), day("WU", TN, "2024-01-20", -1.2)]);
    expect(year?.tn?.record).toEqual([27.3, "2024-08-11", -1.2, "2024-01-20"]);
  });

  it("drops the days the network itself marks as not representative, and keeps the ones it left unmarked", () => {
    const year = yearOf([day("WU", TN, "2024-02-01", -20, "No representatiu"), day("WU", TN, "2024-02-02", 5, undefined), day("WU", TN, "2024-02-03", 6, "")]);
    expect(year?.tn?.months[1]).toEqual([5, 1, 0, 1]);
  });

  it("stops rather than guess when the network says something about a day it has never said before", () => {
    expect(() => yearOf([day("WU", TN, "2024-02-01", 5, "Dubtós")])).toThrow(/Dubtós/);
  });

  it("refuses an answer that is not a year", () => {
    expect(() => weatherSource.withYear({}, 2024, ["<html>"])).toThrow(/rows/);
    expect(() => weatherSource.withYear({}, 2024, [[day("WU", TN, "2024-11-30", 8)]])).toThrow(/December/);
    expect(() => yearOf([day("WU", TN, "2024-02-01", 5), day("WU", TN, "2024-02-01", 5)])).toThrow(/twice/);
    const full = Array.from({ length: 50000 }, () => december);
    expect(() => weatherSource.withYear({}, 2024, [full])).toThrow(/cut short/);
  });

  it("adds the year to what the file held, and never joins one station to another", () => {
    const first = weatherSource.withYear({}, 2023, [[day("WU", TN, "2023-12-31", 8), day("D5", TN, "2023-12-31", 4)]]);
    const second = weatherSource.withYear(first, 2024, [[december]]);
    expect(Object.keys(second["WU.json"]?.years ?? {})).toEqual(["2023", "2024"]);
    expect(Object.keys(second["D5.json"]?.years ?? {})).toEqual(["2023"]);
    expect(second["WU.json"]).toMatchObject({ code: "WU", name: "Badalona - Museu", altitude: 42 });
  });
});
