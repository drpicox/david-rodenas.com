import { describe, expect, it } from "vitest";
import { renderRatchetFigure } from "./renderRatchetFigure";
import type { Shape } from "./shapeOf";

const shape = (againstStability: number, deepestCore: number, tallestStack: number, untested: number): Shape => ({ againstStability, deepestCore, tallestStack, untested });
const shapes = [shape(0, 1, 1, 5), shape(1, 2, 3, 7), shape(1, 2, 3, 6), shape(1, 2, 3, 6)];
const began = { at: 2, date: "2026-09-29T11:00:00+02:00" };

describe("the figure of the ratchet", () => {
  const figure = renderRatchetFigure(shapes, 3, began);

  it("names every measure the ratchet holds, what it counts, and its value at the commit shown", () => {
    expect(figure).toMatch(/arrows against stability[\s\S]*<td class="now">1<\/td>/);
    expect(figure).toMatch(/untested files[\s\S]*<td class="now">6<\/td>/);
    expect(figure).toContain("no test imports");
  });

  it("draws how each measure went over the history, and where the ratchet began", () => {
    expect(figure.match(/<svg class="ratchet-line"/g)).toHaveLength(4);
    expect(figure).toContain('class="began"');
  });

  it("says since when the ratchet holds them, and whether any has gone up since", () => {
    expect(figure).toContain("The ratchet holds them from 29 September 2026: since then, none has gone up.");
    const loosened = renderRatchetFigure([...shapes.slice(0, 3), shape(1, 2, 3, 8)], 3, began);
    expect(loosened).toContain("since then, the untested files went up");
  });

  it("says, at a commit before the ratchet, that it began after it", () => {
    expect(renderRatchetFigure(shapes, 1, began)).toContain("The ratchet began on 29 September 2026, after this commit.");
  });

  it("draws a history of one commit, and all of it at nothing, without dividing by nothing", () => {
    expect(renderRatchetFigure([shape(0, 0, 0, 0)], 0, null)).not.toMatch(/NaN|Infinity|undefined/);
  });
});
