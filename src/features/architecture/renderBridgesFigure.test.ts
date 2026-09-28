import { describe, expect, it } from "vitest";
import { renderBridgesFigure } from "./renderBridgesFigure";
import type { Snapshot } from "./Snapshot";

const file = (id: number, path: string) => ({ id, path, lines: 1, test: false });
// A star: four features need one frame file, and one of them needs another feature's file.
const snapshot: Snapshot = {
  modules: [file(0, "platform/plugin/Feature.ts"), file(1, "features/a/a.ts"), file(2, "features/b/b.ts"), file(3, "features/c/c.ts"), file(4, "features/d/d.ts")],
  dependencies: [1, 2, 3, 4].map((from) => ({ from, to: 0, typeOnly: false })),
};
const between = new Map([[0, 6], [1, 0], [2, 0], [3, 0], [4, 0]]);

describe("the figure of the files that stand between the others", () => {
  const figure = renderBridgesFigure(snapshot, between);

  it("lists the files most of the shortest ways between two others pass through, with the share of them, what they need and what needs them", () => {
    expect([...figure.matchAll(/<tr><td><code>(.*?)<\/code><\/td><td>([^<]+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td>/g)].map(([, path = "", share, needs, neededBy]) => [path.replaceAll("<wbr>", ""), share, Number(needs), Number(neededBy)])).toEqual([["platform/plugin/Feature.ts", "100%", 0, 4]]);
  });

  it("says which file most ways pass through, and on what share of them", () => {
    expect(figure).toContain("platform/plugin/Feature.ts stands on 100% of the shortest ways between two other files");
  });
});
