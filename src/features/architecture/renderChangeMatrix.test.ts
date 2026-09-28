import { describe, expect, it } from "vitest";
import type { MatrixRow } from "./changeMatrixOf";
import { renderChangeMatrix } from "./renderChangeMatrix";

const commits = ["2026-09-07T09:00:00+02:00", "2026-09-07T18:00:00+02:00", "2026-09-08T10:00:00+02:00", "2026-09-14T10:00:00+02:00"].map((date, at) => ({ sha: `c${at}`, date, subject: `commit ${at}` }));
const rows: MatrixRow[] = [
  { box: "main.ts", band: "src", cells: [[0, 0, 1], [3, 1, 0]] },
  { box: "platform/page", band: "platform", cells: [[0, 0, 2], [1, 1, 0], [2, 4, 0]] },
  { box: null, band: null, cells: [[0, 0, 1], [1, 1, 0]] },
];

describe("the picture of where the changes went", () => {
  const svg = renderChangeMatrix(rows, commits, new Set([2]));

  it("labels every row with its box, band by band, and the files that went last", () => {
    const labels = [...svg.matchAll(/<text class="row"[^>]*>([^<]*)</g)].map(([, label]) => label);
    expect(labels).toEqual(["main.ts", "page", "gone"]);
    expect([...svg.matchAll(/<text class="band"[^>]*>([^<]*)</g)].map(([, band]) => band)).toEqual(["src", "platform"]);
  });

  it("draws a cell for every commit that changed files in a box, darker the more it changed", () => {
    const shades = [...svg.matchAll(/<rect class="changed"[^>]*style="--v:([\d.]+)"/g)].map(([, v]) => Number(v));
    expect(shades).toHaveLength(4);
    expect(shades[2]).toBeGreaterThan(shades[1] ?? 1);
  });

  it("marks with a dot where a commit wrote files", () => {
    expect(svg.match(/<circle class="written"/g)).toHaveLength(3);
  });

  it("shades the column of a sweep, saying what the commit was", () => {
    expect(svg).toMatch(/<rect class="sweep"[^>]*><title>[^<]*commit 2<\/title>/);
  });

  it("says under it the days the commits fell on", () => {
    expect(svg).toContain(">7 Sep<");
    expect(svg).toContain(">14 Sep<");
  });
});
