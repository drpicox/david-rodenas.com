import { describe, expect, it } from "vitest";
import { aStation } from "./aStation";
import { flatSums } from "./flatSums";
import { renderNo2Figure } from "./renderNo2Figure";

const station = aStation({
  "2019": { workdays: flatSums(60, 20), weekends: flatSums(30, 8) },
  "2020": { workdays: flatSums(20, 20), weekends: flatSums(10, 8) },
});

describe("the whole figure", () => {
  it("says what is being looked at: where, which days, which years", () => {
    const html = renderNo2Figure(station, { from: 2019, to: 2020, days: "workdays" });
    expect(html).toContain("Somewhere");
    expect(html).toContain("Monday to Friday");
    expect(html).toContain("2019–2020");
  });

  it("names the years the station has, not the years that were asked for", () => {
    expect(renderNo2Figure(station, { from: 1991, to: 2025, days: "all" })).toContain("2019–2020");
    expect(renderNo2Figure(station, { from: 2020, to: 2020, days: "all" })).toContain(", 2020");
  });

  it("says how far the year still running reaches, when it is among the years looked at", () => {
    const running = { ...aStation({ ...station.years, "2021": { workdays: flatSums(25, 20), weekends: flatSums(12, 8) } }), soFar: { year: 2021, through: "2021-09-28" } };
    const caption = (to: number) => /<figcaption>.*?<\/figcaption>/.exec(renderNo2Figure(running, { from: 2019, to, days: "all" }))?.[0];
    expect(caption(2021)).toContain("2019–2021, 2021 to 28 September");
    expect(caption(2020)).not.toContain("to 28 September");
  });

  it("holds the table, the key to its colours, and the years", () => {
    const html = renderNo2Figure(station, { from: 2019, to: 2020, days: "all" });
    expect(html).toContain('<table class="heat graded">');
    expect(html).toContain('class="scale"');
    expect(html).toContain('<svg class="years"');
  });
});
