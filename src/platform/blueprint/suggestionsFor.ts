import type { Blueprint, PinRef, PlacedNode } from "./Blueprint";
import type { Evaluation } from "./Evaluation";
import type { Kit } from "./kitOf";
import type { Literal, OutputPin } from "./NodeKind";
import type { Table } from "./Table";

/** A next step offered after a node: a kind to add, wired from one of its outputs into an input of the new node, with its inputs written. */
export interface Suggestion {
  readonly label: string;
  readonly kind: string;
  readonly from: string;
  readonly into: string;
  readonly values: Readonly<Record<string, Literal>>;
  /** A second wire, from another node into another input of the new one: what a join joins with. */
  readonly also?: { readonly from: PinRef; readonly into: string };
}

/** As many as a row of buttons has room for, the likeliest first. */
const MOST = 8;
/** Types that so many inputs take that offering every taker would offer nothing. */
const PRIMITIVE = new Set(["text", "flag", "value"]);

/** Every node joined to one by wires, either way, however far: what it comes from, and what comes of it. */
function joinedTo(blueprint: Blueprint, id: string): Set<string> {
  const joined = new Set([id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const wire of blueprint.wires)
      if (joined.has(wire.from.node) !== joined.has(wire.to.node)) {
        joined.add(wire.from.node);
        joined.add(wire.to.node);
        grew = true;
      }
  }
  return joined;
}

/** At most this many joins are offered: the tables that share most keys with this one. */
const JOINS = 2;

/** The tables apart from a node that a join could set beside it: those whose keys hold its own, or are held by them, those that share most first. */
function joinsFor(table: Table, from: string, blueprint: Blueprint, id: string, kit: Kit, evaluation: Evaluation): Suggestion[] {
  const mine = new Set(table.columns.filter((column) => column.key).map((column) => column.name));
  const apart = joinedTo(blueprint, id);
  return blueprint.nodes
    .flatMap((node) => {
      const result = evaluation.get(node.id);
      const kind = kit.kinds.get(node.kind);
      const output = kind?.outputs.find((pin) => pin.type === "table");
      if (apart.has(node.id) || !kind || !output || result?.state !== "done") return [];
      const theirs = new Set(((result.outputs[output.name] as Table | undefined)?.columns ?? []).filter((column) => column.key).map((column) => column.name));
      const shared = [...theirs].filter((name) => mine.has(name)).length;
      // Months beside months, or each month beside its year; never months beside the hours of a day, which share a column and nothing else.
      if (shared === 0 || (shared < theirs.size && shared < mine.size)) return [];
      return [{ shared, suggestion: { label: `Join with ${node.title ?? kind.title}`, kind: "join", from, into: "left", values: {}, also: { from: { node: node.id, pin: output.name }, into: "right" } } }];
    })
    .sort((a, b) => b.shared - a.shared)
    .slice(0, JOINS)
    .map(({ suggestion }) => suggestion);
}

/**
 * What is likely to come after a table, read off its columns — which say
 * which row a row is, which hold what was measured — and off the tables
 * beside it. A table standing apart from another is there to be joined to
 * it, and a table made of two sources to be crossed: how a measure of one
 * goes with a measure of the other comes first.
 */
function afterTable(table: Table, from: string, blueprint: Blueprint, node: PlacedNode, kit: Kit, evaluation: Evaluation): Suggestion[] {
  const offer = (label: string, kind: string, values: Record<string, Literal>): Suggestion[] => (kit.kinds.has(kind) ? [{ label, kind, from, into: "table", values }] : []);
  const named = (name: string) => table.columns.find((column) => column.name === name);
  const keyed = (name: string) => named(name)?.key === true;
  const keys = table.columns.filter((column) => column.key);
  const numericKeys = keys.filter((column) => column.kind === "number").map((column) => column.name);
  const textKeys = keys.filter((column) => column.kind !== "number").map((column) => column.name);
  const measures = table.columns.filter((column) => !column.key && column.kind === "number");
  const m = measures[0]?.name;
  const crossed = (table.credits?.length ?? 0) >= 2;
  const unlike = measures.filter((column) => column.name !== m && column.unit && column.unit !== measures[0]?.unit);
  // Crossed, the measure set against the first is one that came from the other source, whatever its unit; else, one in another unit.
  const other = (crossed ? (measures.find((column) => column.joined && column.name !== m) ?? unlike.at(-1)) : unlike[0])?.name;
  const whole = named("whole") !== undefined;

  const filters = whole && table.rows.some((row) => row["whole"] === "no") ? offer("Only what was measured whole", "keep", { column: "whole", is: "equals", value: "yes" }) : [];
  const [first, second] = numericKeys;
  const split = textKeys[0];
  const x = numericKeys.includes("month") ? "month" : first;
  const pictures = !m
    ? []
    : numericKeys.length === 1 && first === "year" && textKeys.length === 0
      ? offer(`Bars of ${m}, year by year`, "bars", { x: "year", y: m, ...(whole && { faded: "whole" }) })
      : numericKeys.length === 1 && first && textKeys.length <= 1
        ? offer(`Lines of ${m} along ${first}${split ? `, a line a ${split}` : ""}`, "lines", { x: first, y: m, ...(split && { split }) })
        : numericKeys.length === 2 && x && first && second
          ? offer(`Heat map of ${m}: ${x} by ${x === first ? second : first}`, "heatmap", { x, y: x === first ? second : first, value: m })
          : [];
  const trends = m && named("year") ? offer(`Trend of ${m}`, "trend", { x: "year", y: m }) : [];
  // A row a group only where the grouping leaves other keys behind: grouped by every key, a table is the same table.
  const grouped = (by: readonly string[]) => keys.some((column) => !by.includes(column.name));
  const and = keyed("season") ? "season" : undefined;
  const groups = !m
    ? []
    : [
        ...(keyed("year") && grouped(["year"]) ? offer(`Mean of ${m} by year`, "group", { by: "year", value: m, how: "mean" }) : []),
        ...(keyed("hour") && grouped(["hour", ...(and ? [and] : [])]) ? offer(`Mean of ${m} by hour${and ? ` and ${and}` : ""}`, "group", { by: "hour", ...(and && { and }), value: m, how: "mean" }) : []),
        ...(keyed("month") && keyed("year") ? offer(`Mean of ${m} by month`, "group", { by: "month", value: m, how: "mean" }) : []),
      ];
  // The season taken out, what is left still follows the years: they are what comes out next, and the season never twice.
  const outBy = node.kind === "season" ? String(node.values["by"] ?? "month") : undefined;
  const seasons = !m || !keyed("month") || !keyed("year") ? [] : outBy === "month" ? offer("Take the years out too", "season", { by: "year" }) : outBy ? [] : offer("Take the season out", "season", { by: "month" });
  const crossings = m && other ? [...offer(`Correlation of ${m} and ${other}`, "correlation", { x: other, y: m }), ...offer(`Scatter: ${m} against ${other}`, "scatter", { x: other, y: m })] : [];
  const joins = joinsFor(table, from, blueprint, node.id, kit, evaluation);
  const more = [
    ...(m ? offer(`Summary of ${m}`, "summary", { column: m }) : []),
    ...(m ? offer(`The ten with the most ${m}`, "top", { by: m, count: 10 }) : []),
    ...(m && table.rows.length >= 30 ? offer(`Histogram of ${m}`, "histogram", { column: m }) : []),
    ...offer("Show the table", "show-table", {}),
  ];
  // A second source standing apart on the canvas is there to be joined: that comes before anything done to this one alone.
  return crossed ? [...filters, ...crossings, ...seasons, ...joins, ...pictures, ...trends, ...groups, ...more] : [...filters, ...joins, ...pictures, ...trends, ...groups, ...seasons, ...crossings, ...more];
}

/** The order the kinds that take something are offered in: what it looks like first, then what it measures, then what can be made of it. */
const ROLES = ["paint", "statistic", "step"];

/** The kinds that take what an output gives as what they are about: a graph's picture, its measures. */
function takers(output: OutputPin, kit: Kit): Suggestion[] {
  if (PRIMITIVE.has(output.type)) return [];
  const rank = (role: string) => (ROLES.includes(role) ? ROLES.indexOf(role) : ROLES.length);
  return [...kit.kinds.values()]
    .filter((kind) => kind.inputs[0]?.type === output.type && kind.role !== "dial")
    .sort((a, b) => rank(a.role) - rank(b.role))
    .map((kind) => ({ label: kind.title, kind: kind.name, from: output.name, into: kind.inputs[0]?.name ?? "", values: {} }));
}

/**
 * What is likely to come after a node, offered as next steps a click adds,
 * already wired and written: what a reader would have to know the nodes to
 * find. After a table, read off its columns — the years measured whole, the
 * bars of a year, a heat map of months, the mean of each hour, the season
 * taken out, a join with a table beside it; after a number, the number on
 * the board; after anything else, the kinds that take it.
 */
export function suggestionsFor(blueprint: Blueprint, id: string, kit: Kit, evaluation: Evaluation): readonly Suggestion[] {
  const node = blueprint.nodes.find((each) => each.id === id);
  const kind = node && kit.kinds.get(node.kind);
  const result = evaluation.get(id);
  if (!kind || result?.state !== "done") return [];
  return kind.outputs
    .flatMap((output): Suggestion[] => {
      // A run made before the node became another kind gave other outputs: nothing is offered after one it did not give.
      if (!(output.name in result.outputs)) return [];
      const value = result.outputs[output.name];
      if (output.type === "table") return afterTable(value as Table, output.name, blueprint, node, kit, evaluation);
      if (output.type === "number") return [{ label: `On the board: ${output.label}`, kind: "readout", from: output.name, into: "value", values: {} }];
      return takers(output, kit);
    })
    .slice(0, MOST);
}
