import { describe, expect, it } from "vitest";
import type { Metrics } from "./Metrics";
import { renderMetricsSparks } from "./renderMetricsSparks";

const metrics = (files: number, crossing: number, inCycles = 0): Metrics => ({ files, tests: 0, lines: 0, boxes: 0, arrows: crossing, crossing, typeOnly: 0, inCycles, testable: 0, tested: 0 });
const history = [metrics(10, 4), metrics(20, 9, 2), metrics(30, 12)];

describe("what the source measured, commit by commit", () => {
  const sparks = renderMetricsSparks(history, 1);

  it("is a line for the files and one for the arrows between boxes, each named", () => {
    expect(sparks.match(/<polyline/g)).toHaveLength(2);
    expect(sparks).toContain("files");
    expect(sparks).toContain("arrows between boxes");
  });

  it("marks the commit being shown", () => {
    expect(sparks).toMatch(/<line class="now" x1="([\d.]+)" x2="\1"/);
  });

  it("marks the commits that had boxes in a circle", () => {
    expect(sparks.match(/<rect class="cycle"/g)).toHaveLength(1);
  });
});
