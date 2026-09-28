import { describe, expect, it } from "vitest";
import { renderTestedChangesFigure } from "./renderTestedChangesFigure";

describe("the figure of the changes that came with their tests", () => {
  const figure = renderTestedChangesFigure({ tested: 138, withTest: 117, untested: 140 });

  it("gives the share of the changes to a tested file that came with its test, as the one number it is", () => {
    expect(figure).toMatch(/<strong[^>]*>85%<\/strong>/);
    expect(figure).toContain("117 of the 138 changes to a file a test imports came with a change to that test, or a new one");
  });

  it("says how many changes went to files no test imports", () => {
    expect(figure).toContain("140 changes went to files with something to run that no test imports");
  });
});
