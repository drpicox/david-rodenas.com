import { describe, expect, it } from "vitest";
import { renderCascadeFigure } from "./renderCascadeFigure";

const cascade = [
  { distance: 1, seen: 400, changed: 100 },
  { distance: 2, seen: 200, changed: 12 },
  { distance: 3, seen: 100, changed: 2 },
  { distance: 4, seen: 30, changed: 1 },
  { distance: 6, seen: 10, changed: 0 },
  { distance: null, seen: 20000, changed: 150 },
];

describe("the figure of how far a change travels", () => {
  const figure = renderCascadeFigure(cascade, 0.0217);

  it("draws a bar for one arrow, two, three, four or more, and for nothing changed below, the far ones counted as one", () => {
    expect([...figure.matchAll(/<text class="label"[^>]*>([^<]+)</g)].map(([, label]) => label)).toEqual(["a file it needs changed", "two arrows down", "three", "four or more", "nothing it needs changed"]);
    expect(figure.match(/<rect class="bar/g)).toHaveLength(5);
  });

  it("writes by each bar the share that changed too, and of how many", () => {
    expect(figure).toContain(">25% · 100 of 400<");
    expect(figure).toContain(">2.5% · 1 of 40<");
    expect(figure).toContain(">0.8% · 150 of 20000<");
  });

  it("puts what the arrows allow beside what the history did", () => {
    expect(figure).toContain("a change to one file can reach 2.2% of the source");
    expect(figure).toContain("when a file it needs changed, a file changed with it in 25% of the commits; two arrows down, in 6%; with nothing it needs changed, in 0.8%");
  });
});
