import type { Blueprint, Wire } from "../../platform/blueprint/Blueprint";
import { columnsOf } from "../../platform/blueprint/columnsOf";
import type { Point } from "../../platform/blueprint/nodeShapeOf";
import { SCHEMATIC } from "./SCHEMATIC";

/** A module standing in the schematic: its column and its row, and its top left corner. */
export interface Module {
  readonly id: string;
  readonly column: number;
  readonly row: number;
  readonly x: number;
  readonly y: number;
}

/** A wire as the schematic runs it: the points it leaves from, turns at, and arrives at. */
export interface Conduit {
  readonly wire: Wire;
  readonly points: readonly Point[];
}

export interface Schematic {
  readonly width: number;
  readonly height: number;
  readonly modules: readonly Module[];
  readonly conduits: readonly Conduit[];
}

/** Twice each way is enough for a page's blueprints to settle, as it is for the tidying. */
const SWEEPS = 2;
/** How far a conduit steps out of a module's end before it turns back, for a wire that goes against the flow. */
const BACK = 12;

/** What one output feeds: its wires, and the place it keeps in each column it only passes through. */
interface Strand {
  readonly key: string;
  readonly node: string;
  readonly wires: Wire[];
  /** The stand-in it has in a column between its module and one it feeds further on, by column. */
  readonly passes: Map<number, string>;
}

const mean = (values: readonly number[]) => (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined);
const strandKeyOf = (wire: Wire) => `${wire.from.node}\u0000${wire.from.pin}`;

/**
 * A blueprint laid out the way an LCARS display lays a system out: on a
 * grid, the computer's own, with nothing left for a hand to place. Each
 * module stands in the column after the furthest of what it needs, level
 * with what feeds it where that place is free. A conduit runs level out of a
 * module's right end and into another's left, and changes level only in the
 * channel between two columns, on a lane of its own there, shared by
 * everything one output feeds. One that goes further than the next column
 * keeps a place of its own in every column it passes, so it never runs
 * behind a module it has nothing to do with: Sugiyama's layers, on a grid.
 */
export function schematicOf(blueprint: Blueprint): Schematic {
  const column = columnsOf(blueprint);
  const order = new Map(blueprint.nodes.map((node, at) => [node.id, at]));
  const wires = blueprint.wires.filter((wire) => order.has(wire.from.node) && order.has(wire.to.node));
  const columnOf = (id: string) => column.get(id) ?? 0;
  const forward = (wire: Wire) => columnOf(wire.to.node) > columnOf(wire.from.node);

  // What stands in the grid: the modules, and a stand-in for each column a strand passes through.
  const strands = new Map<string, Strand>();
  const before = new Map<string, string[]>();
  const after = new Map<string, string[]>();
  const join = (from: string, to: string) => {
    if (before.get(to)?.includes(from)) return;
    before.set(to, [...(before.get(to) ?? []), from]);
    after.set(from, [...(after.get(from) ?? []), to]);
  };
  for (const wire of wires) {
    const key = strandKeyOf(wire);
    const strand = strands.get(key) ?? { key, node: wire.from.node, wires: [], passes: new Map<number, string>() };
    strands.set(key, strand);
    strand.wires.push(wire);
    if (!forward(wire)) continue;
    let previous = wire.from.node;
    for (let at = columnOf(wire.from.node) + 1; at < columnOf(wire.to.node); at += 1) {
      const pass = strand.passes.get(at) ?? `\u0000${key}\u0000${at}`;
      if (!strand.passes.has(at)) {
        strand.passes.set(at, pass);
        column.set(pass, at);
        order.set(pass, order.size);
      }
      join(previous, pass);
      previous = pass;
    }
    join(previous, wire.to.node);
  }

  // Down each column, everything stands level with its neighbours where it can, and under whatever took that place first.
  const columns = [...new Set([...order.keys()].map(columnOf))].sort((a, b) => a - b);
  const standing = (at: number) => [...order.keys()].filter((id) => columnOf(id) === at);
  const row = new Map<string, number>();
  const stack = (at: number, side: ReadonlyMap<string, string[]>) => {
    const wishes = standing(at).map((id) => ({ id, wish: mean((side.get(id) ?? []).flatMap((other) => (row.has(other) ? [row.get(other) as number] : []))) ?? row.get(id) }));
    wishes.sort((a, b) => (a.wish ?? Infinity) - (b.wish ?? Infinity) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    let free = 0;
    for (const { id, wish } of wishes) {
      // Half way between two rows is the upper one: a module fed by two stands level with the first.
      const taken = Math.max(wish === undefined ? free : Math.ceil(wish - 0.5), free);
      row.set(id, taken);
      free = taken + 1;
    }
  };
  for (const at of columns) stack(at, before);
  for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
    for (const at of [...columns].reverse()) stack(at, after);
    for (const at of columns) stack(at, before);
  }
  const used = [...new Set(row.values())].sort((a, b) => a - b);
  const rowOf = (id: string) => used.indexOf(row.get(id) ?? 0);

  // Where everything is drawn: the rows are all as high, the channels as wide as the lanes they hold.
  const middle = (id: string) => rowOf(id) * SCHEMATIC.row + SCHEMATIC.pad / 2;
  const leaving = new Map<string, number>();
  for (const node of blueprint.nodes) {
    const mine = [...strands.values()].filter((strand) => strand.node === node.id);
    // The first output leaves from the middle, so that what it feeds, level with it, is fed by a straight run.
    mine.forEach((strand, at) => leaving.set(strand.key, middle(node.id) + Math.ceil(at / 2) * (at % 2 === 1 ? 1 : -1) * SCHEMATIC.port));
  }
  /** The level a strand is at as it comes into the channel before a column: out of its module, or through its stand-in. */
  const levelInto = (strand: Strand, at: number) => (at - 1 === columnOf(strand.node) ? (leaving.get(strand.key) ?? 0) : middle(strand.passes.get(at - 1) ?? strand.node));
  const arriving = new Map<Wire, number>();
  for (const node of blueprint.nodes) {
    const level = middle(node.id);
    const coming = wires.filter((wire) => wire.to.node === node.id && forward(wire)).map((wire) => ({ wire, from: levelInto(strands.get(strandKeyOf(wire)) as Strand, columnOf(node.id)) }));
    const most = Math.floor((SCHEMATIC.pad / 2 - 2) / SCHEMATIC.port);
    const [above, below] = [coming.filter(({ from }) => from < level).sort((a, b) => b.from - a.from), coming.filter(({ from }) => from > level).sort((a, b) => a.from - b.from)];
    // What comes level goes straight in at the middle; what comes from above or below keeps to its own side of it.
    for (const { wire } of coming.filter(({ from }) => from === level)) arriving.set(wire, level);
    above.forEach(({ wire }, at) => arriving.set(wire, level - Math.min(at + 1, most) * SCHEMATIC.port));
    below.forEach(({ wire }, at) => arriving.set(wire, level + Math.min(at + 1, most) * SCHEMATIC.port));
  }

  /** Where a strand comes out of the channel after a column: into what it feeds there, and on to its stand-in if it goes further. */
  const levelsOutOf = (strand: Strand, at: number) => [
    ...strand.wires.filter((wire) => forward(wire) && columnOf(wire.to.node) === at + 1).map((wire) => arriving.get(wire) ?? 0),
    ...(strand.passes.has(at + 1) ? [middle(strand.passes.get(at + 1) as string)] : []),
  ];
  const lanes = new Map<number, string[]>();
  for (const at of columns) {
    const turning = [...strands.values()].flatMap((strand) => {
      const [from, to] = [levelInto(strand, at + 1), levelsOutOf(strand, at)];
      const through = at === columnOf(strand.node) || strand.passes.has(at);
      return through && to.some((level) => level !== from) ? [{ key: strand.key, from, rises: (mean(to) ?? from) < from }] : [];
    });
    // Those that rise keep left, the highest first; those that fall keep right, the highest last: so that fewest cross.
    const [rising, falling] = [turning.filter((each) => each.rises).sort((a, b) => a.from - b.from), turning.filter((each) => !each.rises).sort((a, b) => b.from - a.from)];
    lanes.set(at, [...rising, ...falling].map((each) => each.key));
  }
  const left = new Map<number, number>();
  let x = 0;
  for (const at of columns) {
    left.set(at, x);
    x += SCHEMATIC.module + Math.max(SCHEMATIC.channel, ((lanes.get(at)?.length ?? 0) + 1) * SCHEMATIC.lane);
  }
  const leftOf = (at: number) => left.get(at) ?? 0;
  const widthOfChannel = (at: number) => leftOf(at + 1) - leftOf(at) - SCHEMATIC.module;
  const laneOf = (strand: Strand, at: number) => {
    const all = lanes.get(at) ?? [];
    return leftOf(at) + SCHEMATIC.module + ((all.indexOf(strand.key) + 1) * widthOfChannel(at)) / (all.length + 1);
  };

  const conduits = wires.map((wire): Conduit => {
    const strand = strands.get(strandKeyOf(wire)) as Strand;
    const [from, to] = [columnOf(wire.from.node), columnOf(wire.to.node)];
    const start = { x: leftOf(from) + SCHEMATIC.module, y: leaving.get(strand.key) ?? middle(wire.from.node) };
    if (!forward(wire)) {
      // Against the flow: out, over the row of the module it goes to, and in from its left.
      const [end, over] = [{ x: leftOf(to), y: middle(wire.to.node) }, rowOf(wire.to.node) * SCHEMATIC.row - (SCHEMATIC.row - SCHEMATIC.pad) / 2];
      return { wire, points: [start, { x: start.x + BACK, y: start.y }, { x: start.x + BACK, y: over }, { x: end.x - BACK, y: over }, { x: end.x - BACK, y: end.y }, end] };
    }
    const points: Point[] = [start];
    let level = start.y;
    for (let at = from; at < to; at += 1) {
      const next = at + 1 === to ? (arriving.get(wire) ?? level) : middle(strand.passes.get(at + 1) as string);
      if (next !== level) points.push({ x: laneOf(strand, at), y: level }, { x: laneOf(strand, at), y: next });
      level = next;
    }
    return { wire, points: [...points, { x: leftOf(to), y: level }] };
  });

  const modules = blueprint.nodes.map((node): Module => ({ id: node.id, column: columns.indexOf(columnOf(node.id)), row: rowOf(node.id), x: leftOf(columnOf(node.id)), y: rowOf(node.id) * SCHEMATIC.row }));
  return {
    width: modules.length > 0 ? Math.max(...modules.map((module) => module.x)) + SCHEMATIC.module : 0,
    height: used.length * SCHEMATIC.row,
    modules,
    conduits,
  };
}
