import { describe, expect, it } from "vitest";
import { changeStills } from "./changeStills";
import { encodeHistory } from "./encodeHistory";

const file = (path: string) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false });
const graph = { modules: ["platform/p/a.ts", "features/f/f.ts", "platform/p/a.test.ts"].map(file), dependencies: [{ from: "features/f/f.ts", to: "platform/p/a.ts", typeOnly: false }, { from: "platform/p/a.test.ts", to: "platform/p/a.ts", typeOnly: false }] };
const step = (sha: string, day: number, touched: string[]) => ({ commit: { sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha }, graph, renamed: [], touched });
const history = JSON.stringify(encodeHistory([step("aaaaaaa", 1, []), step("bbbbbbb", 2, ["platform/p/a.ts", "features/f/f.ts"])]));
// The build reads what the page asks for from public/; this one has the history and no coverage counted.
const read = (path: string) => {
  if (path === "/data/architecture.json") return history;
  throw new Error(`no ${path}`);
};

describe("the page on how the site changes, in the HTML before any script", () => {
  it("says which commit it stands at: the last one", () => {
    expect(changeStills["change-player"]?.(read, [])).toContain("the last of 2 commits");
  });

  it("draws every place the page names from the history, with or without the lines the tests ran", () => {
    for (const [name, still] of Object.entries(changeStills)) expect(still(read, []), name).toMatch(/^<(figure|p) /);
  });
});
