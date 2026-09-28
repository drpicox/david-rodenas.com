import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { renderSettlingFigure } from "./renderSettlingFigure";

const life = (id: number, born: number, changed: number[], test = false): Life => ({ id, path: `${id}.ts`, lines: 10, test, typesOnly: false, born, changed });
// Twenty commits: one file changed twice just after it was written and once much later, three never changed, and a test that is not counted.
const lives = [life(0, 0, [1, 2, 15]), life(1, 0, []), life(2, 3, []), life(3, 10, []), life(4, 0, [1, 2, 3, 4], true)];

describe("the figure of how a file settles", () => {
  const figure = renderSettlingFigure(lives, 20);

  it("draws a bar for every band of ages, with the share of commits that changed a file at that age written on it", () => {
    // Ages 1, 2, 3–4, 5–8, 9–16 and 17–19: the oldest file lived nineteen commits.
    expect(figure.match(/<rect class="bar"/g)).toHaveLength(6);
    expect(figure).toContain(">25%<");
    expect(figure).toContain(">3–4<");
  });

  it("says how many of the files that ship have never changed since they were written, the tests left out", () => {
    expect(figure).toContain("3 of the 4 files that ship have not changed since the commit that wrote them");
  });

  it("says how often a file changed at first, and how often once it had lived eight commits", () => {
    // Two changes in the eight commits the four files lived at ages one and two; one in the thirty-one they lived after their eighth.
    expect(figure).toContain("in 25% of the first two commits it lived through");
    expect(figure).toContain("in 3.2% of those after its eighth");
  });
});
