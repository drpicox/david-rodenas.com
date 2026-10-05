import { describe, expect, it } from "vitest";
import { aKit } from "../blueprint/aKit";
import { coreNodes } from "../blueprint/coreNodes";
import { coreTypes } from "../blueprint/coreTypes";
import { kitOf } from "../blueprint/kitOf";
import type { NodeKind } from "../blueprint/NodeKind";
import type { Table } from "../blueprint/Table";
import { Site } from "../content/Site";
import { blueprintTool } from "./blueprintTool";

const site = new Site([{ file: "wired.md", markdown: "---\ntitle: Wired\n---\n```::blueprint\nnights\n```\n" }]);
const nothing = { site, origin: "https://example.com", read: () => Promise.reject(new Error("no files")) };

/** A source kept in two files, one leading to the other, as a station's file and the year still running beside it do. */
const kept: NodeKind = {
  name: "kept",
  title: "Kept",
  role: "source",
  shelf: "Test",
  summary: "a table kept in a file, and how many rows of it another file says",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const rows = JSON.parse(read("/data/rows.json")) as { x: number; y: number }[];
    const keep = Number(read(`/data/${rows.length}.txt`));
    return { outputs: { table: { columns: [{ name: "x", kind: "number" }, { name: "y", kind: "number" }], rows: rows.slice(0, keep) } satisfies Table } };
  },
};
const files: Record<string, string> = { "/data/rows.json": JSON.stringify([{ x: 1, y: 2 }, { x: 2, y: 4.123456 }, { x: 3, y: 7 }]), "/data/3.txt": "3" };

describe("blueprints, as a tool an agent writes them for", () => {
  const tool = blueprintTool(aKit);

  it("says how a blueprint is written, and every kind there is, with what each takes", () => {
    expect(tool.description).toContain("one node a line");
    expect(tool.description).toContain("Tables: ");
    expect(tool.description).toContain("join(left, right, on)");
    expect([tool.shows, tool.readOnly, tool.inputSchema.required]).toEqual([true, true, ["text"]]);
  });

  it("answers with what every node said, the numbers it gave, and the tables it drew, and shows it on the page that has blueprints", async () => {
    const reply = await tool.answer({ text: 'n = nights\nfit = trend table: n y: nights\nbars "Nights" table: n' }, nothing);
    expect(reply).toMatchObject({ summary: "fit: +20 nights a decade; Nights: nights by year, 5 bars", route: "/wired/", show: { app: "blueprint", values: { text: 'n = nights\nfit = trend table: n y: nights\nbars "Nights" table: n' } } });
    const nodes = (reply as { data: { nodes: Record<string, unknown>[] } }).data.nodes;
    expect(nodes[1]).toMatchObject({ id: "fit", kind: "trend", numbers: { "per-ten": 20, slope: 2, change: 8 } });
    expect(nodes[2]).toMatchObject({ title: "Nights", table: { columns: ["year", "nights (nights)"], totalRows: 5 } });
  });

  it("fetches the files a blueprint asks for, as it finds it needs them", async () => {
    const withFiles = blueprintTool(kitOf([...coreNodes, kept], coreTypes));
    const reply = await withFiles.answer({ text: "k = kept\nsummary table: k column: y" }, { ...nothing, read: async (path) => files[path] ?? Promise.reject(new Error("404")) });
    expect((reply as { data: { nodes: { numbers?: Record<string, number> }[] } }).data.nodes[1]?.numbers).toMatchObject({ count: 3, highest: 7 });
  });

  it("refuses, by line, a blueprint it cannot read, and says what went wrong at each node that went wrong", async () => {
    expect(await tool.answer({ text: "bars tabel: x" }, nothing)).toEqual({ refused: "line 1: bars takes no tabel" });
    const reply = await tool.answer({ text: "bars" }, nothing);
    expect((reply as { summary: string }).summary).toBe("bars: wire or write: table");
  });
});
