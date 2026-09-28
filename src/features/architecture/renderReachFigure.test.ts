import { describe, expect, it } from "vitest";
import { renderReachFigure } from "./renderReachFigure";
import type { Snapshot } from "./Snapshot";

const file = (id: number, path: string) => ({ id, path, lines: 1, test: false });
const chain = (count: number): Snapshot => ({ modules: Array.from({ length: count }, (_, id) => file(id, `platform/p/f${id}.ts`)), dependencies: Array.from({ length: count - 1 }, (_, id) => ({ from: id + 1, to: id, typeOnly: false })) });
// The source grows from a chain of two to a chain of four, and to four files of which only two are joined.
const snapshots: Snapshot[] = [chain(2), chain(4), { modules: chain(4).modules, dependencies: [{ from: 1, to: 0, typeOnly: false }] }];

describe("the figure of how far a change could reach, commit by commit", () => {
  const figure = renderReachFigure(snapshots, 2);

  it("draws the propagation cost at every commit", () => {
    expect(figure).toMatch(/<polyline class="reach" points="[^"]+"/);
    expect((figure.match(/<polyline class="reach" points="([^"]+)"/)?.[1] ?? "").split(" ")).toHaveLength(3);
  });

  it("says what it is now and what it was at the first commit, and the files a change to which could reach the most", () => {
    expect(figure).toContain("a change to one file could reach 31% of the source, on average; at the first commit, 75%");
    expect(figure).toContain("platform/p/f0.ts, whose change could reach 1 file");
  });
});
