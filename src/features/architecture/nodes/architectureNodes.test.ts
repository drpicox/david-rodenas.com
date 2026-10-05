import { describe, expect, it } from "vitest";
import { coreTypes } from "../../../platform/blueprint/coreTypes";
import { kitOf } from "../../../platform/blueprint/kitOf";
import type { Editor, NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import type { History } from "../History";
import { architectureNodes } from "./architectureNodes";
import { aroundNode } from "./aroundNode";
import { arrowsNode } from "./arrowsNode";
import { boxesNode } from "./boxesNode";
import type { CodeGraph } from "./CodeGraph";
import { commitsNode } from "./commitsNode";
import { degreesOf } from "./degreesOf";
import { filesNode } from "./filesNode";
import { graphTableOf } from "./graphTableOf";
import { graphType } from "./graphType";
import { historyIn } from "./historyIn";
import { knotNode } from "./knotNode";
import { measureNode } from "./measureNode";
import { networkNode } from "./networkNode";
import { onlyFilesNode } from "./onlyFilesNode";
import { pictureNode } from "./pictureNode";
import { renderTangleSvg } from "./renderTangleSvg";
import { sourceNode } from "./sourceNode";
import { subgraphOf } from "./subgraphOf";
import { tangleLayoutOf } from "./tangleLayoutOf";

const change = (parts: Partial<History["changes"][number]>): History["changes"][number] => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed: [], linked: [], unlinked: [], ...parts });

/** A small source: two files of the frame, a feature that needs both, its test; then another feature, and changes. */
const history: History = {
  commits: [
    { sha: "aaaaaaa1", date: "2026-09-01T10:00:00+02:00", subject: "The frame, and a feature. It works." },
    { sha: "bbbbbbb2", date: "2026-09-02T10:00:00+02:00", subject: "Another feature" },
    { sha: "ccccccc3", date: "2026-09-03T10:00:00+02:00", subject: "Both features lean on the frame's second file" },
  ],
  changes: [
    change({
      added: [
        [1, "platform/a/A.ts", 10, false],
        [2, "platform/a/B.ts", 20, false],
        [3, "features/x/X.ts", 30, false],
        [4, "features/x/X.test.ts", 5, true],
      ],
      linked: [
        [2, 1, false],
        [3, 1, false],
        [3, 2, true],
        [4, 3, false],
      ],
    }),
    change({ added: [[5, "features/y/Y.ts", 40, false]], linked: [[5, 1, false]], changed: [1] }),
    change({ linked: [[5, 2, false]], changed: [1, 3] }),
  ],
};
const text = JSON.stringify(history);
const context = { read: (path: string) => (path === "/data/architecture.json" ? text : "") };
const run = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, context);
const graphOf = (inputs: Record<string, unknown> = {}) => run(sourceNode, inputs).outputs?.["graph"] as CodeGraph;
const pathsIn = (graph: CodeGraph) => graph.snapshot.modules.map((module) => module.path);

describe("the source, as a graph", () => {
  it("is the last commit unless another is asked for, without its tests unless they are", () => {
    expect(pathsIn(graphOf())).toEqual(["platform/a/A.ts", "platform/a/B.ts", "features/x/X.ts", "features/y/Y.ts"]);
    expect(pathsIn(graphOf({ commit: 0, tests: true }))).toEqual(["platform/a/A.ts", "platform/a/B.ts", "features/x/X.ts", "features/x/X.test.ts"]);
    expect(run(sourceNode, {}).said).toBe("4 files · 5 arrows · 3 Sep");
  });

  it("refuses a commit the history has not got", () => {
    expect(() => run(sourceNode, { commit: 7 })).toThrow("commit: the history runs from 0 to 2");
  });

  it("is turned by a slider along the history, which says the day of each commit", () => {
    const editor = (sourceNode.inputs[0]?.editor as (read: (path: string) => string) => Editor)(context.read);
    expect(editor).toMatchObject({ kind: "number", min: 0, max: 2, step: 1 });
    expect(editor.kind === "number" && editor.show?.(1)).toBe("2 Sep, commit 2 of 3");
    expect(historyIn(context.read).history.commits.length).toBe(3);
  });
});

describe("a graph as a table", () => {
  it("is a row a file: its path, its box, its lines, whether a test, and how many need it and it needs", () => {
    const table = graphTableOf(graphOf());
    expect(table.rows[0]).toEqual({ file: "platform/a/A.ts", box: "platform/a", lines: 10, test: "no", needed: 3, needs: 0 });
    expect(table.credits).toEqual([{ said: "This site's source at commit ccccccc, of 3 Sep 2026." }]);
    expect(run(filesNode, { graph: graphOf() }).outputs?.["table"]).toEqual(table);
  });

  it("is what a graph becomes wired into an input that takes a table, and says itself in a few words", () => {
    expect(graphType.becomes?.["table"]?.(graphOf())).toEqual(graphTableOf(graphOf()));
    expect(graphType.describe(graphOf())).toBe("4 files · 5 arrows");
  });

  it("counts each other node once, however many arrows join them", () => {
    const { neededBy, needs } = degreesOf({ modules: [{ id: 1, path: "a", lines: 1, test: false }, { id: 2, path: "b", lines: 1, test: false }], dependencies: [{ from: 1, to: 2, typeOnly: false }, { from: 1, to: 2, typeOnly: true }] });
    expect([neededBy.get(2), needs.get(1)]).toEqual([1, 1]);
  });
});

describe("measures of the graph, a column each", () => {
  it("adds a measure as a column of the table it becomes", () => {
    const measured = run(measureNode, { graph: graphOf(), what: "reach" }).outputs?.["graph"] as CodeGraph;
    expect(graphTableOf(measured).rows.map((row) => [row["file"], row["reach"]])).toEqual([
      ["platform/a/A.ts", 3],
      ["platform/a/B.ts", 2],
      ["features/x/X.ts", 0],
      ["features/y/Y.ts", 0],
    ]);
  });

  it("looks back over the history for how often a file changed, up to the commit shown", () => {
    const measured = run(measureNode, { graph: graphOf({ commit: 1 }), what: "changes" }).outputs?.["graph"] as CodeGraph;
    expect(graphTableOf(measured).rows.map((row) => row["changes"])).toEqual([1, 0, 0, 0]);
  });

  it("puts each file in a group by name, and refuses a measure there is none of", () => {
    const grouped = run(measureNode, { graph: graphOf(), what: "group" }).outputs?.["graph"] as CodeGraph;
    expect(graphTableOf(grouped).columns.at(-1)).toMatchObject({ name: "group", kind: "text" });
    expect(() => run(measureNode, { graph: graphOf(), what: "beauty" })).toThrow("what: there is no measure beauty");
  });
});

describe("steps on a graph", () => {
  it("gathers files into their boxes, adding up what was measured of them", () => {
    const measured = run(measureNode, { graph: graphOf(), what: "changes" }).outputs?.["graph"] as CodeGraph;
    const boxes = run(boxesNode, { graph: measured }).outputs?.["graph"] as CodeGraph;
    expect(graphTableOf(boxes).rows).toEqual([
      { box: "features/x", files: 1, lines: 30, needed: 0, needs: 1, changes: 1 },
      { box: "features/y", files: 1, lines: 40, needed: 0, needs: 1, changes: 0 },
      { box: "platform/a", files: 2, lines: 30, needed: 2, needs: 0, changes: 2 },
    ]);
  });

  it("keeps only the files a path asks for, or all but them", () => {
    expect(pathsIn(run(onlyFilesNode, { graph: graphOf(), path: "features/*", keep: "matching" }).outputs?.["graph"] as CodeGraph)).toEqual(["features/x/X.ts", "features/y/Y.ts"]);
    expect(pathsIn(run(onlyFilesNode, { graph: graphOf(), path: "B.ts", keep: "others" }).outputs?.["graph"] as CodeGraph)).toEqual(["platform/a/A.ts", "features/x/X.ts", "features/y/Y.ts"]);
  });

  it("keeps a file and what is around it, along the arrows asked for", () => {
    const around = run(aroundNode, { graph: graphOf(), file: "B.ts", steps: 1, way: "needed" });
    expect(pathsIn(around.outputs?.["graph"] as CodeGraph)).toEqual(["platform/a/B.ts", "features/x/X.ts", "features/y/Y.ts"]);
    expect(around.settled).toEqual({ file: "platform/a/B.ts" });
    expect(() => run(aroundNode, { graph: graphOf(), file: "Z.ts", steps: 1, way: "both" })).toThrow("file: no file's path has Z.ts in it");
  });

  it("keeps the knot: the files of the deepest core, unless another depth is asked for", () => {
    const knot = run(knotNode, { graph: graphOf() });
    expect(knot.settled).toEqual({ depth: 2 });
    expect(pathsIn(knot.outputs?.["graph"] as CodeGraph)).toEqual(["platform/a/A.ts", "platform/a/B.ts", "features/x/X.ts", "features/y/Y.ts"]);
  });

  it("cuts a graph down to some nodes, with only the arrows among them", () => {
    expect(subgraphOf(graphOf(), new Set([1, 2])).snapshot.dependencies).toEqual([{ from: 2, to: 1, typeOnly: false }]);
  });
});

describe("tables of the arrows, and of the history", () => {
  it("lists every arrow, the boxes it joins, and whether all it needs is a type", () => {
    const table = run(arrowsNode, { graph: graphOf() }).outputs?.["table"] as Table;
    expect(table.rows.find((row) => row["from"] === "features/x/X.ts" && row["to"] === "platform/a/B.ts")).toEqual({ from: "features/x/X.ts", to: "platform/a/B.ts", "from box": "features/x", "to box": "platform/a", crossing: "yes", "types only": "yes" });
  });

  it("lists every commit, what it changed, and what the source measured after it", () => {
    const table = run(commitsNode, {}).outputs?.["table"] as Table;
    expect(table.rows.map((row) => [row["commit"], row["date"], row["changed"], row["files"], row["subject"]])).toEqual([
      [0, "2026-09-01", 0, 3, "The frame, and a feature."],
      [1, "2026-09-02", 1, 4, "Another feature"],
      [2, "2026-09-03", 2, 4, "Both features lean on the frame's second file"],
    ]);
  });
});

describe("the network's figures", () => {
  it("are numbers to wire on, and a table", () => {
    const { outputs } = run(networkNode, { graph: graphOf() });
    expect(outputs).toMatchObject({ files: 4, arrows: 5, stack: 2 });
    expect((outputs?.["table"] as Table).rows[0]).toMatchObject({ figure: "files", value: 4 });
  });
});

describe("the picture of the source", () => {
  it("draws the graph in its boxes, each ball as big as a column and as deep as another", () => {
    const measured = run(measureNode, { graph: graphOf(), what: "reach" }).outputs?.["graph"] as CodeGraph;
    const { painting } = run(pictureNode, { graph: measured, size: "needed", colour: "reach", layout: "boxes" });
    expect(painting?.html).toContain('class="bp-picture"');
    expect(painting?.html.match(/<circle class="ball"/g)?.length).toBe(4);
    expect(painting?.html).toContain("color-mix(in srgb, var(--bp-heat) 100%, var(--paper))");
    expect(painting?.html).toContain("color-mix(in srgb, var(--bp-heat) 30%, var(--paper))");
    expect(painting?.caption).toBe("4 files, as big as needed, coloured by reach");
  });

  it("draws it tangled, coloured a group a colour", () => {
    const grouped = run(measureNode, { graph: graphOf(), what: "group" }).outputs?.["graph"] as CodeGraph;
    const html = run(pictureNode, { graph: grouped, colour: "group", layout: "tangle" }).painting?.html ?? "";
    expect(html).toContain('class="architecture tangle"');
    expect(html).toMatch(/class="ball bp-s\d"/);
    expect(html.match(/class="thread" d="([^"]+)"/)?.[1]?.match(/M/g)?.length).toBe(5);
  });

  it("tangles the same way every time, so the build and the browser draw the same", () => {
    const { snapshot } = graphOf();
    expect(tangleLayoutOf(snapshot, 400, 300)).toEqual(tangleLayoutOf(snapshot, 400, 300));
    expect(renderTangleSvg(snapshot, tangleLayoutOf(snapshot, 400, 300), {}, 400, 300)).toContain('viewBox="0 0 400 300"');
  });
});

describe("what the source brings a blueprint", () => {
  it("is found by name, and takes and gives only what flows along wires there are", () => {
    const kit = kitOf(architectureNodes, [...coreTypes, graphType]);
    const strange = architectureNodes.flatMap((kind) => [...kind.inputs, ...kind.outputs].filter((pin) => !kit.types.has(pin.type)).map((pin) => `${kind.name}.${pin.name}`));
    expect(strange).toEqual([]);
  });
});
