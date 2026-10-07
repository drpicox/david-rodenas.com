import { describe, expect, it } from "vitest";
import type { NodeKind, Painting } from "../NodeKind";
import type { Table } from "../Table";
import { barsNode } from "./barsNode";
import { cellLabel } from "./cellLabel";
import { heatmapNode } from "./heatmapNode";
import { linesNode } from "./linesNode";
import { readoutNode } from "./readoutNode";
import { scatterNode } from "./scatterNode";
import { showTableNode } from "./showTableNode";

const painted = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, { read: () => "" });
const painting = (kind: NodeKind, inputs: Record<string, unknown>) => painted(kind, inputs).painting as Painting;

const years: Table = {
  columns: [
    { name: "station", kind: "text", key: true },
    { name: "year", kind: "number", key: true },
    { name: "days", kind: "number", unit: "nights" },
    { name: "whole", kind: "text" },
  ],
  rows: [
    { station: "WU", year: 2024, days: 30, whole: "yes" },
    { station: "WU", year: 2025, days: 40, whole: "yes" },
    { station: "WU", year: 2026, days: 33, whole: "no" },
    { station: "X4", year: 2024, days: 50, whole: "yes" },
    { station: "X4", year: 2025, days: null, whole: "yes" },
  ],
  credits: [{ said: "Meteocat.", refreshed: "2026-10-02" }],
};

describe("a category, named along an axis", () => {
  it("is a year as a year, a fraction short, and nothing as a dash", () => {
    expect([cellLabel(2024), cellLabel(0.123456), cellLabel("Girona"), cellLabel(null)]).toEqual(["2024", "0.123", "Girona", "—"]);
  });
});

describe("bars", () => {
  it("draw a bar a row, faint where the column asked for says no, and say whose numbers they are", () => {
    const { html, caption, credits } = painting(barsNode, { table: { ...years, rows: years.rows.slice(0, 3) }, x: "year", y: "days", faded: "whole" });
    expect(html.match(/class="bar( faded)?"/g)).toEqual(['class="bar"', 'class="bar"', 'class="bar faded"']);
    expect(caption).toBe("days by year, 3 bars");
    expect(credits).toEqual(["Meteocat. Brought up to date 2026-10-02."]);
  });

  it("refuse more bars than can be seen", () => {
    const many: Table = { ...years, rows: Array.from({ length: 300 }, (_, at) => ({ station: "WU", year: at, days: at, whole: "yes" })) };
    expect(() => painted(barsNode, { table: many })).toThrow("300 rows would be 300 bars: group them, or keep the top ones, first");
  });

  it("choose their columns when left to them, and say which they chose", () => {
    expect(painted(barsNode, { table: years }).settled).toEqual({ x: "station", y: "days" });
  });
});

describe("lines", () => {
  it("draw a line for each value of the column they are split by", () => {
    const { html, caption } = painting(linesNode, { table: years, x: "year", y: "days", split: "station" });
    expect(html.match(/data-key="line:[^"]+"/g)).toEqual(['data-key="line:WU"', 'data-key="line:X4"']);
    expect(caption).toBe("days along year, a line for each station");
  });
});

describe("what is named in an order of its own", () => {
  const seasons: Table = {
    columns: [
      { name: "hour", kind: "number", key: true },
      { name: "season", kind: "text", key: true, order: ["winter", "spring", "summer", "autumn"] },
      { name: "no2", kind: "number" },
    ],
    rows: ["autumn", "spring", "summer", "winter"].flatMap((season, at) => [1, 2].map((hour) => ({ hour, season, no2: at + hour }))),
    credits: [],
  };

  it("is drawn in that order, a line or a colour each, not in the order the rows come in", () => {
    expect(painting(linesNode, { table: seasons, x: "hour", y: "no2", split: "season" }).html.match(/data-key="line:[^"]+"/g)).toEqual(['data-key="line:winter"', 'data-key="line:spring"', 'data-key="line:summer"', 'data-key="line:autumn"']);
    expect(painting(scatterNode, { table: seasons, x: "hour", y: "no2", colour: "season" }).html.match(/<text[^>]*>(winter|spring|summer|autumn)<\/text>/g)?.map((label) => label.replace(/<[^>]*>/g, ""))).toEqual(["winter", "spring", "summer", "autumn"]);
  });
});

describe("lines of two columns", () => {
  it("draw a line for each, named after it", () => {
    const both: Table = { columns: [{ name: "month", kind: "number" }, { name: "clean", kind: "number" }, { name: "debt", kind: "number" }], rows: [{ month: 1, clean: 1, debt: 2 }, { month: 2, clean: 3, debt: 3 }] };
    const { html, caption } = painting(linesNode, { table: both, x: "month", y: "clean", and: "debt" });
    expect(html.match(/data-key="line:[^"]+"/g)).toEqual(['data-key="line:clean"', 'data-key="line:debt"']);
    expect(caption).toBe("clean and debt along month");
  });
});

describe("a scatter", () => {
  it("draws a dot for each row with both, says r in its caption, and fits the line when asked", () => {
    const { html, caption } = painting(scatterNode, { table: years, x: "year", y: "days", fit: true, colour: "station", label: "station" });
    expect(html.match(/class="dot/g)?.length).toBe(4);
    expect(html).toContain('class="fit"');
    expect(caption).toMatch(/^days against year, 4 rows, r = /);
  });

  it("leaves the line out when asked to", () => {
    expect(painting(scatterNode, { table: years, x: "year", y: "days", fit: false }).html).not.toContain('class="fit"');
  });
});

describe("a heat map", () => {
  it("draws a cell for each pair of values that has one, the mean of any rows that share it", () => {
    const { html, caption } = painting(heatmapNode, { table: years, x: "year", y: "station", value: "days" });
    expect(html.match(/class="cell"/g)?.length).toBe(4);
    expect(caption).toBe("days by year and station");
  });
});

describe("a table, and a number, on the board", () => {
  it("shows the table's first rows", () => {
    expect(painting(showTableNode, { table: years, rows: 2 }).html).toContain("and 3 rows more");
  });

  it("shows one number, large, with its unit, and says it at its node's foot rather than twice on the board", () => {
    const { painting: shown, said } = painted(readoutNode, { value: -0.4213, unit: "r" });
    expect(shown?.html).toContain("−0.421");
    expect(shown?.caption).toBeUndefined();
    expect(said).toBe("−0.421 r");
  });
});
