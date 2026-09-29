import { describe, expect, it } from "vitest";
import type { Change, History } from "./History";
import type { HistoryRead } from "./readHistory";
import type { Snapshot } from "./Snapshot";
import type { SourceGraph } from "./SourceGraph";
import { unheldCouplingsOf } from "./unheldCouplingsOf";

const change = (changed: number[]): Change => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed, linked: [], unlinked: [] });
const PATHS = ["platform/page/page.ts", "platform/browser/term.ts", "platform/browser/nav.ts", "main.ts", "old/gone.ts"];
// All five changed together three times.
const history: History = { commits: [], changes: [change([0, 1, 2, 3, 4]), change([0, 1, 2, 3, 4]), change([0, 1, 2, 3, 4])] };
const then: Snapshot = { modules: PATHS.map((path, id) => ({ id, path, lines: 1, test: false })), dependencies: [] };
const read: HistoryRead = { history, snapshots: [then, then, then], lives: [] };

const file = (path: string) => ({ path, lines: 1, test: path.endsWith(".test.ts"), typesOnly: false });
const arrow = (from: string, to: string) => ({ from, to, typeOnly: false });
/** The source as it is now: nav needs the page, main puts the rest together, and the gone file is gone. */
const now = (tests: SourceGraph = { modules: [], dependencies: [] }): SourceGraph => ({
  modules: [...PATHS.slice(0, 4).map(file), ...tests.modules],
  dependencies: [arrow("platform/browser/nav.ts", "platform/page/page.ts"), arrow("main.ts", "platform/browser/term.ts"), arrow("main.ts", "platform/browser/nav.ts"), ...tests.dependencies],
});

describe("the files that keep changing together with nothing to hold them", () => {
  it("are every two files of different boxes that changed together as often as asked, with no arrow joining them, near or far, and no test importing both", () => {
    expect(unheldCouplingsOf(read, now(), 3)).toEqual([{ a: "platform/browser/term.ts", b: "platform/page/page.ts", together: 3 }]);
  });

  it("leave out the composition, which changes with everything it puts together, and the files that are gone", () => {
    const found = unheldCouplingsOf(read, now(), 3).flatMap(({ a, b }) => [a, b]);
    expect(found).not.toContain("main.ts");
    expect(found).not.toContain("old/gone.ts");
  });

  it("are held by a test that imports both: the contract is written down where it can fail", () => {
    const contract = { modules: [file("platform/browser/contract.test.ts")], dependencies: ["platform/page/page.ts", "platform/browser/term.ts", "platform/browser/nav.ts"].map((to) => arrow("platform/browser/contract.test.ts", to)) };
    expect(unheldCouplingsOf(read, now(contract), 3)).toEqual([]);
  });

  it("leave out two files of one box, since changing together is what makes a box one", () => {
    const within = { modules: [file("platform/browser/pair.test.ts")], dependencies: [] };
    const found = unheldCouplingsOf(read, now(within), 3);
    // term.ts and nav.ts are both of platform/browser.
    expect(found.some(({ a, b }) => a === "platform/browser/nav.ts" && b === "platform/browser/term.ts")).toBe(false);
  });

  it("count only what changed together as often as asked", () => {
    expect(unheldCouplingsOf(read, now(), 4)).toEqual([]);
  });
});
