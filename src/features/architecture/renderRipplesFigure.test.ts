import { describe, expect, it } from "vitest";
import { renderRipplesFigure } from "./renderRipplesFigure";

const ripple = (across: boolean, typeOnly: boolean, changes: number, carried: number) => ({ across, typeOnly, changes, carried });

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
});
