import { describe, expect, it } from "vitest";
import { aWeatherStation, steadyYear } from "./aWeatherStation";
import { daysPerYear } from "./daysPerYear";
import { renderDaysCalendar } from "./renderDaysCalendar";

const ALL = Array.from({ length: 12 }, (_, month) => month);
const years = daysPerYear(aWeatherStation({ "2023": steadyYear(2023, 21, [0]), "2024": steadyYear(2024, 19) }), { variable: "tn", atLeast: true, threshold: 20, months: ALL });

describe("the years as a calendar: when in the year the days fell", () => {
  it("is a table with a row a year, newest first, and the counts in it", () => {
    const html = renderDaysCalendar(years, true);
    expect(html.indexOf(">2024<")).toBeLessThan(html.indexOf(">2023<"));
    expect(html).toContain('title="February 2023: 28 of 28 days"');
    expect(html).toMatch(/style="--v:1"[^>]*>28</);
  });

  it("colours by the share of the month, so February can be as full as July", () => {
    expect(renderDaysCalendar(years, true).match(/--v:1"/g)).toHaveLength(11);
  });

  it("tells a month with no such day from a month nobody measured", () => {
    const html = renderDaysCalendar(years, true);
    expect(html).toContain('<td class="none" title="January 2023: not measured"></td>');
    expect(html).toContain('title="July 2024: 0 of 31 days"');
  });

  it("is warm for heat and not for the rest", () => {
    expect(renderDaysCalendar(years, true)).toContain('class="heat calendar warm"');
    expect(renderDaysCalendar(years, false)).toContain('class="heat calendar"');
  });
});
