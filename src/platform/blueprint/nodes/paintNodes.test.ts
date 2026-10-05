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

  it("shows one number, large, with its unit", () => {
    expect(painting(readoutNode, { value: -0.4213, unit: "r" })).toMatchObject({ caption: "−0.421 r" });
  });
});
