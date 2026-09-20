import { describe, expect, it } from "vitest";
import { aWeatherStation, steadyYear } from "./aWeatherStation";
import { renderWeatherFigure } from "./renderWeatherFigure";

const ALL = Array.from({ length: 12 }, (_, month) => month);
const tropical = { variable: "tn", atLeast: true, threshold: 20, months: ALL } as const;
const station = aWeatherStation({
  "2020": steadyYear(2020, 19),
  "2021": steadyYear(2021, 19),
  "2022": steadyYear(2022, 21),
  "2023": steadyYear(2023, 21, [11]),
  "2024": steadyYear(2024, 21),
  "2025": steadyYear(2025, 21),
});

describe("the whole weather figure", () => {
  const html = renderWeatherFigure(station, tropical);

  it("says where, how high, and what is being counted", () => {
    expect(html).toContain("Somewhere");
    expect(html).toContain("100 m");
    expect(html).toContain("days with a daily minimum of 20 °C or more, whole year");
  });

  it("puts the two halves of the record side by side, in days a year, from whole years only", () => {
    // Whole years: 2020, 2021 | 2022, 2024, 2025. 2023 lost its December.
    expect(html).toContain("2020–2021");
    expect(html).toContain("<strong>0</strong>");
    expect(html).toContain("2022–2025");
    expect(html).toContain("<strong>365.3</strong>");
  });

  it("draws the year with a hole in it as an outline, and says how much of it was measured", () => {
    expect(html).toMatch(/class="bar partial" data-year="2023"/);
    expect(html).toContain("2023: 334 days, with only 334 of 365 days measured");
  });

  it("holds the days a year, the calendar, and the year in one figure", () => {
    expect(html.match(/<svg class="years"/g)).toHaveLength(2);
    expect(html).toContain('<table class="heat calendar warm">');
  });

  it("gives a year with a hole in it no yearly figure: a mean of eleven months is not a year's", () => {
    const yearly = html.slice(html.lastIndexOf("<svg"));
    expect(yearly).toContain("<title>2022: 21 °C</title>");
    expect(yearly).not.toContain("<title>2023:");
  });

  it("remembers the most extreme day on record, which no histogram could", () => {
    expect(html).toContain("21 °C on 1 July 2022");
  });

  it("says so plainly when the station never measured the variable", () => {
    expect(renderWeatherFigure(station, { ...tropical, variable: "pp" })).toContain("has no daily rain");
  });
});
