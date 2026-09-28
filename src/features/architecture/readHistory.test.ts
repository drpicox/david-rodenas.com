import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";

const graph = { modules: [{ path: "a.ts", lines: 3, test: false, typesOnly: false }], dependencies: [] };
const text = JSON.stringify(encodeHistory([{ commit: { sha: "one", date: "2026-09-07", subject: "one" }, graph, renamed: [], touched: [] }]));

describe("the history, read for the questions a page asks of it", () => {
  it("gives the history with every snapshot and every life", () => {
    const read = readHistory(text);
    expect(read.history.commits.map(({ sha }) => sha)).toEqual(["one"]);
    expect(read.snapshots).toHaveLength(1);
    expect(read.lives.map(({ path }) => path)).toEqual(["a.ts"]);
  });

  it("reads the same text once, however many figures of a page ask for it", () => {
    expect(readHistory(text)).toBe(readHistory(text));
    expect(readHistory(`${text} `)).not.toBe(readHistory(text));
  });
});
