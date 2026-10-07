import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import { coreTypes } from "./coreTypes";
import { kitOf } from "./kitOf";
import type { PinType } from "./PinType";
import { peekOf } from "./peekOf";
import type { Table } from "./Table";

const nights: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "nights", kind: "number", unit: "nights", about: "the nights that stayed above 20 °C" },
  ],
  rows: [
    { year: 2024, nights: 30 },
    { year: 2025, nights: 34 },
  ],
  credits: [],
};

describe("a look at what flows out of an output", () => {
  it("says what a table is, shows its first rows, and what its columns are, where they say", () => {
    const html = peekOf(nights, "table", aKit).html;
    expect(html).toContain('<p class="bp-peek-said">a table: 2 rows · year, nights</p>');
    expect(html).toContain('<td class="number">34</td>');
    expect(html).toContain("<li><strong>nights</strong> the nights that stayed above 20 °C</li>");
  });

  it("shows, of what becomes a table wherever one is taken, the table it becomes", () => {
    const pair: PinType = { name: "pair", label: "a pair", colour: "--x", describe: () => "two years", becomes: { table: () => nights } };
    const html = peekOf({}, "pair", kitOf([], [...coreTypes, pair])).html;
    expect(html).toContain('<p class="bp-peek-said">a pair: two years</p>');
    expect(html).toContain("<p>Wherever a table is taken, it is this one:</p>");
    expect(html).toContain('<td class="number">2024</td>');
  });

  it("says a number as a person reads it, and nothing more", () => {
    expect(peekOf(14.4712, "number", aKit).html).toBe('<div class="bp-peek"><p class="bp-peek-said">a number: 14.47</p></div>');
  });
});
