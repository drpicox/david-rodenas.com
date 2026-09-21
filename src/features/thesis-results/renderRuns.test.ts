import { describe, expect, it } from "vitest";
import { renderRuns } from "./renderRuns";

const runs = [
  { algorithm: "pairs", vertices: 8, graphs: 150, serial: 42.43, openmp: 14.34, cuda: 2.572 },
  { algorithm: "pairs", vertices: 24, graphs: 150, serial: 4387.13, openmp: 1208.97, cuda: 109.093 },
  { algorithm: "common-labelling", vertices: 24, graphs: 50, serial: 71670.13, openmp: 20274.32, cuda: 2332.076 },
] as const;

describe("the measurements of the thesis, as a table with its bars", () => {
  const html = renderRuns(runs);

  it("says each time the way a person would: what took an hour and a quarter took under two minutes", () => {
    expect(html).toMatch(/24 vertices.*1 h 13 min.*20 min.*1 min 49 s/s);
    expect(html).toMatch(/19 h 54 min.*5 h 37 min.*39 min/s);
    expect(html).toContain("42 s");
    expect(html).toContain("2.6 s");
  });

  it("says how many times faster, and draws it on one scale so the rows can be compared", () => {
    expect(html).toContain("×40");
    expect(html).toContain("×16");
    expect(html).toContain("×3.6");
    expect(html).toMatch(/--p:1(\.000)?"/);
    expect(html).toMatch(/--p:0\.4\d\d"/);
  });

  it("keeps the two algorithms apart, each under its name", () => {
    expect(html.match(/<tbody>/g)).toHaveLength(2);
    expect(html).toContain("every pair of 150 graphs");
    expect(html).toContain("one labelling common to 50 graphs");
  });
});
