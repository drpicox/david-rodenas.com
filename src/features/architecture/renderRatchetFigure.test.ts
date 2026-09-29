import { describe, expect, it } from "vitest";
import { renderRatchetFigure } from "./renderRatchetFigure";
import type { Shape } from "./shapeOf";

const shape = (againstStability: number, deepestCore: number, tallestStack: number, untested: number): Shape => ({ againstStability, deepestCore, tallestStack, untested });
const shapes = [shape(0, 1, 1, 5), shape(1, 2, 3, 7), shape(1, 2, 3, 6), shape(1, 2, 3, 6)];
const holding = (untested: number) => ({ againstStability: 1, deepestCore: 2, tallestStack: 3, untested });
// The ratchet came in at the third commit, holding 7 untested files; the fourth wrote in the gain, 6.
const held = [null, null, holding(7), holding(6)];
const dates = ["2026-09-27T10:00:00+02:00", "2026-09-28T10:00:00+02:00", "2026-09-29T11:00:00+02:00", "2026-09-30T11:00:00+02:00"];

describe("the figure of the ratchet", () => {
  const figure = renderRatchetFigure(shapes, 3, held, dates);

  it("names every measure, what it counts, and at the commit shown both what the ratchet holds and what the source measures", () => {
    expect(figure).toMatch(/untested files[\s\S]*<td class="held">6<\/td><td class="now">6<\/td>/);
    expect(figure).toContain("no test imports");
  });

  it("draws each measure over the history and, as a band under it, what the ratchet held, from where it began", () => {
    expect(figure.match(/<svg class="ratchet-line"/g)).toHaveLength(4);
    expect(figure).toContain('class="held-band"');
    expect(figure).toContain('class="began"');
  });

  it("says whether the source measures what the ratchet holds, and names what it does not", () => {
    expect(figure).toContain("and the source measures the same");
    expect(renderRatchetFigure(shapes, 2, held, dates)).toContain("the source measures 6 files with something to run that no test imports, below what it holds");
  });

  it("tells how the ratchet went: when it began and what it held, and every change to it since", () => {
    expect(figure).toContain("29 September 2026: began, holding 1 box arrow against stability, a core 2 deep, a stack 3 arrows tall and 7 files with something to run that no test imports");
    expect(figure).toContain("30 September 2026: tightened, the untested files from 7 to 6");
  });

  it("says whether, since it began, the source ever measured more than the ratchet held", () => {
    expect(figure).toContain("At no commit since it began has the source measured more than the ratchet held.");
    const overrun = renderRatchetFigure(shapes, 3, [null, null, holding(7), holding(5)], dates);
    expect(overrun).toContain("At 1 commit since it began, the source measured more than the ratchet held: the untested files.");
  });

  it("says, at a commit before the ratchet, that it began after it, and holds nothing there", () => {
    const before = renderRatchetFigure(shapes, 1, held, dates);
    expect(before).toContain("The ratchet began on 29 September 2026, after this commit.");
    expect(before).toMatch(/<td class="held">–<\/td>/);
  });

  it("draws a history of one commit with no ratchet, all of it at nothing, without dividing by nothing", () => {
    expect(renderRatchetFigure([shape(0, 0, 0, 0)], 0, [null], [dates[0] ?? ""])).not.toMatch(/NaN|Infinity|undefined/);
  });
});
