import { describe, expect, it } from "vitest";
import { detailsOf } from "./detailsOf";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";

const PATHS = ["platform/p/low.ts", "platform/p/mid.ts", "features/f/top.ts", ...[0, 1, 2, 3, 4, 5].map((n) => `features/h/idle${n}.ts`)];
const graph = {
  modules: PATHS.map((path) => ({ path, lines: 10, test: false, typesOnly: false })),
  dependencies: [
    { from: "platform/p/mid.ts", to: "platform/p/low.ts", typeOnly: false },
    { from: "features/f/top.ts", to: "platform/p/mid.ts", typeOnly: false },
  ],
};
const step = (sha: string, day: number, touched: string[]) => ({ commit: { sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: `${sha}, said` }, graph, renamed: [], touched });
const read = readHistory(JSON.stringify(encodeHistory([step("aaaaaaa", 1, []), step("bbbbbbb", 2, ["platform/p/low.ts", "platform/p/mid.ts"]), step("ccccccc", 3, ["features/f/top.ts"]), step("ddddddd", 4, ["platform/p/low.ts", "platform/p/mid.ts"])])));

describe("the details of what is chosen on the picture", () => {
  it("with nothing chosen, are the network's: its size, its paths and clustering against a random one, and how to choose", () => {
    const network = detailsOf(read, 3, null, null);
    expect(network).toContain("The network");
    expect(network).toContain("Click a file or a box");
    expect(network).toMatch(/<dt>files<\/dt><dd>9, joined by 2 arrows/);
    expect(network).toContain("small-world-ness");
  });

  it("with nothing chosen, say its clustering as what it is, an average over the files, and its paths as the largest part's", () => {
    const network = detailsOf(read, 3, null, null);
    expect(network).toContain("of the pairs of files joined to a file, the share joined to each other too, on average over the files");
    expect(network).toContain("between two files of the largest part");
  });

  it("with nothing chosen, at a commit with no arrows yet, divides by nothing", () => {
    expect(detailsOf(read, 0, null, null)).not.toMatch(/NaN|Infinity|undefined/);
    const lone = readHistory(JSON.stringify(encodeHistory([{ ...step("aaaaaaa", 1, []), graph: { modules: graph.modules.slice(0, 1), dependencies: [] } }])));
    expect(detailsOf(lone, 0, null, null)).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("with nothing chosen, name the files the network turns on, each a way to its own details", () => {
    // What mid needs, top needs through it: the most needed of all is low.
    expect(detailsOf(read, 3, null, null)).toMatch(/<dt>most needed<\/dt><dd><button type="button" data-file="platform\/p\/low\.ts">low\.ts<\/button>/);
  });

  it("for a file, say where it stands in the network and in the history, and give a way to its code as it stood at the commit shown", () => {
    const mid = detailsOf(read, 3, { file: "platform/p/mid.ts" }, null);
    expect(mid).toContain('href="https://github.com/drpicox/david-rodenas.com/blob/ddddddd/src/platform/p/mid.ts"');
    expect(mid).toMatch(/<dt>needed by<\/dt><dd>1 directly; a change to it could reach 1 file<\/dd>/);
    expect(mid).toMatch(/<dt>changed<\/dt><dd>2 times/);
    expect(mid).toContain("bbbbbbb, said");
    expect(mid).toMatch(/<dt>last changed<\/dt><dd>4 Sep, at the commit shown<\/dd>/);
    expect(mid).toMatch(/<dt>tests<\/dt><dd>no test imports it<\/dd>/);
  });

  it("for a file, say the place it shares by PageRank, and leave unsaid what its links cannot make", () => {
    const top = detailsOf(read, 3, { file: "features/f/top.ts" }, null);
    // Needed by nothing, as the six idle files are: they rank alike.
    expect(top).toMatch(/<dt>PageRank<\/dt><dd>joint 3rd of 9, with 6 others<\/dd>/);
    expect(top).toMatch(/<dt>clustering<\/dt><dd>none: fewer than two files joined to it<\/dd>/);
    expect(top).toMatch(/<dt>between<\/dt><dd>on none of the shortest ways between two others<\/dd>/);
    expect(top).toMatch(/<dt>apart<\/dt><dd>/);
  });

  it("for a file, make what it changed with, and its box, ways to their own details, and give a way back", () => {
    const mid = detailsOf(read, 3, { file: "platform/p/mid.ts" }, null);
    expect(mid).toMatch(/<dt>changed with<\/dt><dd><button type="button" data-file="platform\/p\/low\.ts">low\.ts<\/button> 2×/);
    expect(mid).toContain('data-box="platform/p"');
    expect(mid).toMatch(/<dt>its group<\/dt><dd>[^<]*<button type="button" data-box=/);
    expect(mid).toContain("data-back");
  });

  it("for a test, leave out the network and what changed with it, which are the files that ship", () => {
    const tested = readHistory(JSON.stringify(encodeHistory([{ ...step("aaaaaaa", 1, []), graph: { ...graph, modules: [...graph.modules, { path: "platform/p/low.test.ts", lines: 5, test: true, typesOnly: false }] } }])));
    const test = detailsOf(tested, 0, { file: "platform/p/low.test.ts" }, null);
    expect(test).toContain("a test");
    expect(test).not.toContain("<h4>In the network</h4>");
    expect(test).not.toContain("changed with");
  });

  it("for a file not there at the commit shown, say so", () => {
    expect(detailsOf(read, 3, { file: "platform/p/gone.ts" }, null)).toContain("is not there at this commit");
  });

  it("for a box that is one file, give a way to its code, not to a folder", () => {
    const root = readHistory(JSON.stringify(encodeHistory([{ ...step("aaaaaaa", 1, []), graph: { modules: [{ path: "main.ts", lines: 10, test: false, typesOnly: false }], dependencies: [] } }])));
    const main = detailsOf(root, 0, { box: "main.ts" }, null);
    expect(main).toContain('href="https://github.com/drpicox/david-rodenas.com/blob/aaaaaaa/src/main.ts"');
    expect(main).toContain(">its code</a>");
  });

  it("for a box, work out its couplings and its instability, and give a way to its folder", () => {
    const box = detailsOf(read, 3, { box: "platform/p" }, null);
    expect(box).toContain('href="https://github.com/drpicox/david-rodenas.com/tree/ddddddd/src/platform/p"');
    expect(box).toContain("I = Ce / (Ca + Ce) = 0 / (1 + 0) = 0");
    expect(box).toMatch(/<dt>Ca<\/dt><dd>1: /);
    expect(box).toContain('data-file="platform/p/low.ts"');
    expect(box).toContain("data-back");
  });
});
