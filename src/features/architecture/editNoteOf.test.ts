import { describe, expect, it } from "vitest";
import { editNoteOf } from "./editNoteOf";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";

const file = (path: string) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false });
const needs = (from: string, to: string) => ({ from, to, typeOnly: false });
const PATHS = ["platform/page/page.ts", "platform/browser/term.ts", "platform/browser/nav.ts", "platform/browser/contract.test.ts"];
// nav needs page; the page and the terminal have no arrow between them, and a test holds the page and the navigation.
const graph = { modules: PATHS.map(file), dependencies: [needs("platform/browser/nav.ts", "platform/page/page.ts"), needs("platform/browser/contract.test.ts", "platform/page/page.ts"), needs("platform/browser/contract.test.ts", "platform/browser/nav.ts")] };
const step = (sha: string, day: number, touched: string[]) => ({ commit: { sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha }, graph, renamed: [], touched });
const read = readHistory(JSON.stringify(encodeHistory([step("aaaaaaa", 1, []), step("bbbbbbb", 2, PATHS.slice(0, 3)), step("ccccccc", 3, PATHS.slice(0, 3)), step("ddddddd", 4, ["platform/page/page.ts"])])));

describe("what an agent is told of a file it has just edited", () => {
  const note = editNoteOf(read, "platform/page/page.ts") ?? "";

  it("says how often the file changed, as far as the history goes", () => {
    expect(note).toContain("platform/page/page.ts changed 3 times");
    expect(note).toContain("to ddddddd");
  });

  it("names what it usually changes with, and says of each one with no arrow whether a test holds the two", () => {
    expect(note).toContain("term.ts 2× (no arrow joins them, and no test imports both)");
    expect(note).toContain("nav.ts 2×");
    expect(note).not.toContain("nav.ts 2× (no arrow");
  });

  it("says what needs it, how far a change to it could reach, and which tests import it", () => {
    expect(note).toContain("needed by 1 file directly; a change to it could reach 1");
    expect(note).toContain("tests that import it: contract.test.ts");
  });

  it("says nothing of a file the history does not know yet", () => {
    expect(editNoteOf(read, "platform/new/new.ts")).toBeNull();
  });
});
