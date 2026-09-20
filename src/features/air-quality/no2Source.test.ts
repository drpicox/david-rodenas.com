import { describe, expect, it } from "vitest";
import { no2Source } from "./no2Source";

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour + 1).padStart(2, "0"));

/** A row as the portal answers it: everything a string, one row for a station, a month and a day of the week. */
function row(station: string, month: number, dow: number, days: number, value: number, missingHours: readonly string[] = []) {
  const cells = HOURS.flatMap((hour) => {
    const n = missingHours.includes(hour) ? 0 : days;
    return [[`s${hour}`, n ? String(value * n) : undefined], [`n${hour}`, String(n)]];
  });
  return { codi_eoi: station, month: String(month), dow: String(dow), days: String(days), ...Object.fromEntries(cells) };
}

const EIXAMPLE = "08019043";
const december = row(EIXAMPLE, 12, 1, 4, 40);

describe("a year of NO2, from the portal to the files", () => {
  it("asks once for the whole year, every station, already added up by month and day of the week", () => {
    const [url, ...rest] = no2Source.requestsFor(2019);
    expect(rest).toEqual([]);
    const asked = new URL(url ?? "");
    expect(asked.pathname).toContain("tasf-thgu");
    expect(asked.searchParams.get("$where")).toContain("contaminant='NO2'");
    expect(asked.searchParams.get("$where")).toContain("'2019-01-01T00:00:00' and '2019-12-31T23:59:59'");
    expect(asked.searchParams.get("$where")).toContain(EIXAMPLE);
    expect(asked.searchParams.get("$group")).toBe("codi_eoi,month,dow");
    expect(asked.searchParams.get("$select")).toContain("sum(h24) as s24");
  });

  it("keeps Monday to Friday apart from Saturday and Sunday", () => {
    const answers = [[row(EIXAMPLE, 1, 0, 4, 20), row(EIXAMPLE, 1, 6, 4, 30), row(EIXAMPLE, 1, 1, 5, 60), row(EIXAMPLE, 1, 5, 4, 50), december]];
    const year = no2Source.withYear({}, 2019, answers)[`${EIXAMPLE}.json`]?.years["2019"];
    expect(year?.weekends.sums[0]?.[8]).toBe(20 * 4 + 30 * 4);
    expect(year?.weekends.counts[0]?.[8]).toBe(8);
    expect(year?.workdays.sums[0]?.[8]).toBe(60 * 5 + 50 * 4);
    expect(year?.workdays.counts[0]?.[8]).toBe(9);
  });

  it("does not count an hour nobody measured", () => {
    const answers = [[row(EIXAMPLE, 3, 2, 4, 40, ["05"]), december]];
    const year = no2Source.withYear({}, 2019, answers)[`${EIXAMPLE}.json`]?.years["2019"];
    expect(year?.workdays.counts[2]?.[4]).toBe(0);
    expect(year?.workdays.sums[2]?.[4]).toBe(0);
    expect(year?.workdays.counts[2]?.[5]).toBe(4);
  });

  it("adds the year to what the file already held, and says who the station is", () => {
    const first = no2Source.withYear({}, 2018, [[december]]);
    const second = no2Source.withYear(first, 2019, [[december]]);
    const file = second[`${EIXAMPLE}.json`];
    expect(Object.keys(file?.years ?? {})).toEqual(["2018", "2019"]);
    expect(file).toMatchObject({ code: EIXAMPLE, name: "Barcelona (Eixample)", kind: "traffic" });
  });

  it("leaves a station that measured nothing that year without the year, not with zeros", () => {
    const files = no2Source.withYear({}, 2019, [[december]]);
    expect(files["08137001.json"]?.years).toEqual({});
  });

  it("refuses an answer that is not a year", () => {
    expect(() => no2Source.withYear({}, 2019, [{ error: true }])).toThrow(/rows/);
    expect(() => no2Source.withYear({}, 2019, [[]])).toThrow(/no rows/);
    // Asked on the second of January, the portal may not have reached December yet.
    expect(() => no2Source.withYear({}, 2019, [[row(EIXAMPLE, 11, 1, 4, 40)]])).toThrow(/December/);
    // More than five Mondays in a month means days counted twice.
    expect(() => no2Source.withYear({}, 2019, [[row(EIXAMPLE, 1, 1, 9, 40), december]])).toThrow(/twice/);
  });
});
