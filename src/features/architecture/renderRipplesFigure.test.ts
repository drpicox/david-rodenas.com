import { describe, expect, it } from "vitest";
import { renderRipplesFigure } from "./renderRipplesFigure";
import type { Ripple } from "./ripplesOf";

const ripple = (across: boolean, typeOnly: boolean, changes: number, carried: number, most: Ripple["most"] = null): Ripple => ({ across, typeOnly, changes, carried, most });

describe("the figure of what each kind of arrow carries", () => {
  it("is a table of the four kinds, with the share of the changes at the head that came with one at the tail, and of how many", () => {
    const figure = renderRipplesFigure([ripple(false, false, 205, 69), ripple(false, true, 76, 42), ripple(true, false, 118, 27), ripple(true, true, 167, 21)]);
    expect([...figure.matchAll(/<td>([^<]+)<\/td>/g)].map(([, cell]) => cell)).toEqual(["34% · 69 of 205", "55% · 42 of 76", "23% · 27 of 118", "13% · 21 of 167"]);
  });

  it("says in words which carried fewer, across boxes and inside one, whichever way it came out", () => {
    const figure = renderRipplesFigure([ripple(false, false, 205, 69), ripple(false, true, 76, 42), ripple(true, false, 118, 27), ripple(true, true, 167, 21)]);
    expect(figure).toContain("Across boxes, an arrow onto a type carried a change less often than one onto a value: 13% against 23%.");
    expect(figure).toContain("Inside a box, more often: 55% against 34%.");
  });

  it("says so when they came out the same", () => {
    const figure = renderRipplesFigure([ripple(false, false, 10, 1), ripple(false, true, 10, 1), ripple(true, false, 10, 1), ripple(true, true, 10, 1)]);
    expect(figure).toContain("Across boxes, an arrow onto a type carried a change as often as one onto a value: 10% against 10%.");
    expect(figure).toContain("Inside a box, as often: 10% against 10%.");
  });

  it("says so when most of the changes to a type across boxes were to one file, and what that file and the rest carried", () => {
    const feature = { path: "platform/plugin/Feature.ts", changes: 138, carried: 8 };
    const figure = renderRipplesFigure([ripple(false, false, 202, 66), ripple(false, true, 76, 42), ripple(true, false, 118, 27), ripple(true, true, 166, 20, feature)]);
    expect(figure).toContain("But 138 of those 166 were changes to one file, platform/plugin/Feature.ts, and carried 5.8%; the rest carried 43%.");
  });

  it("says nothing of one file that is not most of them", () => {
    const figure = renderRipplesFigure([ripple(false, false, 10, 1), ripple(false, true, 10, 1), ripple(true, false, 10, 1), ripple(true, true, 10, 1, { path: "a.ts", changes: 5, carried: 0 })]);
    expect(figure).not.toContain("But ");
  });
});
