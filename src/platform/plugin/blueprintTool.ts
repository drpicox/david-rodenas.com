import type { Evaluation } from "../blueprint/Evaluation";
import { evaluateBlueprint } from "../blueprint/evaluateBlueprint";
import { footOf } from "../blueprint/footOf";
import type { Kit } from "../blueprint/kitOf";
import { parseBlueprint } from "../blueprint/parseBlueprint";
import { Pending } from "../blueprint/Pending";
import type { Table } from "../blueprint/Table";
import { pageShowing } from "../content/pageShowing";
import type { AgentTool } from "./AgentTool";

/** No more rows of a table in an answer than this: an agent wants the figures, not the whole file. */
const MOST_ROWS = 40;
/** Files asked for in turn, as a blueprint finds it needs them: a station, then the year still running beside it. */
const MOST_ROUNDS = 8;

/** Every kind, shelf by shelf, with what it takes: what an agent needs to write a blueprint without reading the page first. */
function kindsSaid(kit: Kit): string {
  const shelves = new Map<string, string[]>();
  for (const kind of kit.kinds.values()) shelves.set(kind.shelf, [...(shelves.get(kind.shelf) ?? []), `${kind.name}(${kind.inputs.map((pin) => pin.name).join(", ")})`]);
  return [...shelves].map(([shelf, kinds]) => `${shelf}: ${kinds.join(", ")}`).join(". ");
}

const rounded = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? Number(value.toPrecision(5)) : value);

/** A blueprint run where files come over the network: run, fetch what it waited for, run again, until nothing waits. */
async function evaluatedFetching(text: string, kit: Kit, read: (path: string) => Promise<string>): Promise<{ blueprint: ReturnType<typeof parseBlueprint>["blueprint"]; evaluation: Evaluation }> {
  const { blueprint } = parseBlueprint(text, kit);
  const files = new Map<string, string | null>();
  const sync = (path: string) => {
    if (!files.has(path)) throw new Pending(path);
    const held = files.get(path);
    if (held === null || held === undefined) throw new Error(`there is no ${path}`);
    return held;
  };
  let evaluation = evaluateBlueprint(blueprint, kit, { read: sync });
  for (let round = 0; round < MOST_ROUNDS; round += 1) {
    const waiting = [...new Set([...evaluation.values()].flatMap((result) => (result.state === "waiting" ? [result.path] : [])))];
    if (waiting.length === 0) break;
    await Promise.all(waiting.map((path) => read(path).then((held) => void files.set(path, held), () => void files.set(path, null))));
    evaluation = evaluateBlueprint(blueprint, kit, { read: sync }, evaluation);
  }
  return { blueprint, evaluation };
}

/**
 * Blueprints as a tool: an agent writes one as text — the way the page
 * writes its examples — and is answered with what every node said, the
 * numbers it worked out, and the tables its pictures were drawn from. Shown,
 * the blueprint is put on the page's first canvas, where the reader can
 * change it, or reset it to the page's own.
 */
export function blueprintTool(kit: Kit): AgentTool {
  return {
    name: "blueprint",
    description:
      "Runs a blueprint: a small dataflow program over this site's data — the Meteocat's weather stations, the Generalitat's NO2 measuring points, this site's own source code as a graph and its history, and its simulations — written as text, one node a line: `name = kind \"Title\" input: value input: value`. " +
      "A value that names another node, or `node.output`, is a wire from it; other values are written as they are, quoted if they have spaces. Tables flow along most wires, so the steps, statistics and pictures work on every source alike. " +
      "For example: `heat = weather-months station: WU` / `air = no2-months station: 08015021` / `both = join left: heat right: air` / `season = season table: both by: month` / `correlation table: season x: tx y: no2`. " +
      "Answers with what each node said, the numbers it gave, and the tables it drew, and can show it to the reader on the blueprints page. " +
      `The kinds: ${kindsSaid(kit)}.`,
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", description: "the blueprint, one node a line, as in the examples on /projects/blueprints/" } },
      required: ["text"],
      additionalProperties: false,
    },
    readOnly: true,
    shows: true,
    async answer(input, { site, read }) {
      const text = String(input["text"] ?? "");
      const { problems } = parseBlueprint(text, kit);
      if (problems.length > 0) return { refused: problems.map((problem) => `line ${problem.line}: ${problem.message}`).join("; ") };
      const { blueprint, evaluation } = await evaluatedFetching(text, kit, read);
      if (blueprint.nodes.length === 0) return { refused: "the blueprint has no nodes: write one a line, as `heat = weather-months station: WU`" };
      const nodes = blueprint.nodes.map((node) => {
        const kind = kit.kinds.get(node.kind);
        const result = evaluation.get(node.id);
        const foot = footOf(result, node.kind);
        const numbers = result?.state === "done" ? Object.fromEntries(Object.entries(result.outputs).filter(([, value]) => typeof value === "number").map(([pin, value]) => [pin, rounded(value)])) : {};
        const drawn = kind?.role === "paint" && result?.state === "done" ? (result.inputs["table"] as Table | undefined) : undefined;
        return {
          id: node.id,
          kind: node.kind,
          ...(node.title && { title: node.title }),
          [foot.trouble ? "problem" : "said"]: foot.said,
          ...(Object.keys(numbers).length > 0 && { numbers }),
          ...(drawn?.columns && { table: { columns: drawn.columns.map((column) => (column.unit ? `${column.name} (${column.unit})` : column.name)), rows: drawn.rows.slice(0, MOST_ROWS).map((row) => drawn.columns.map((column) => rounded(row[column.name] ?? null))), totalRows: drawn.rows.length } }),
        };
      });
      const said = blueprint.nodes.flatMap((node) => {
        const role = kit.kinds.get(node.kind)?.role;
        const foot = footOf(evaluation.get(node.id), node.kind);
        return role === "paint" || role === "statistic" || foot.trouble ? [`${node.title ?? node.id}: ${foot.said}`] : [];
      });
      const route = pageShowing(site, "blueprint")?.route;
      return { summary: said.join("; ") || "The blueprint ran; nothing in it paints or sums up.", data: { nodes }, ...(route !== undefined && { route }), show: { app: "blueprint", values: { text } } };
    },
  };
}
