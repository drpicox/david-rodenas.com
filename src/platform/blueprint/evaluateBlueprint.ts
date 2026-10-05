import type { Blueprint, PlacedNode, Wire } from "./Blueprint";
import type { Evaluation, NodeResult } from "./Evaluation";
import type { Kit } from "./kitOf";
import type { InputPin, Literal, NodeKind, Ran, RunContext } from "./NodeKind";
import { Pending } from "./Pending";

/** The nodes in an order where each comes after every node its wires come from, the document's order kept where nothing decides; and the ones caught in a circle, which no order can place. */
function ordered(blueprint: Blueprint): { order: PlacedNode[]; circled: PlacedNode[] } {
  const waitingOn = new Map(blueprint.nodes.map((node) => [node.id, 0]));
  const after = new Map<string, string[]>();
  for (const { from, to } of blueprint.wires) {
    if (!waitingOn.has(from.node) || !waitingOn.has(to.node)) continue;
    waitingOn.set(to.node, (waitingOn.get(to.node) ?? 0) + 1);
    after.set(from.node, [...(after.get(from.node) ?? []), to.node]);
  }
  const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const ready = blueprint.nodes.filter((node) => waitingOn.get(node.id) === 0).map((node) => node.id);
  const order: PlacedNode[] = [];
  for (let id = ready.shift(); id !== undefined; id = ready.shift()) {
    const node = byId.get(id);
    if (node) order.push(node);
    for (const next of after.get(id) ?? []) {
      const left = (waitingOn.get(next) ?? 0) - 1;
      waitingOn.set(next, left);
      if (left === 0) ready.push(next);
    }
  }
  const placed = new Set(order);
  return { order, circled: blueprint.nodes.filter((node) => !placed.has(node)) };
}

const flagOf = (value: unknown) => value === true || value === "yes" || value === "true" || value === "on" || value === 1;

/** A value written by hand, as the input takes it: a typed "12" is twelve, a "yes" is true. */
function literalAs(type: string, literal: Literal): unknown {
  if (type === "number") return Number(literal);
  if (type === "flag") return flagOf(literal);
  if (type === "text") return String(literal);
  return literal;
}

type Resolved = { readonly inputs: Record<string, unknown> } | { readonly result: NodeResult };

/** What a run needs to know of the blueprint at every node: the wire into each input, and the kind of each node. */
interface Surveyed {
  readonly into: ReadonlyMap<string, Wire>;
  readonly kindOf: ReadonlyMap<string, NodeKind | undefined>;
}

const pinKey = (node: string, pin: string) => `${node}\u0000${pin}`;

/** Everything a node is handed — along its wires, written on it, or what its inputs start with — or why it cannot be handed it. */
function resolve(node: PlacedNode, kind: NodeKind, { into, kindOf }: Surveyed, kit: Kit, results: ReadonlyMap<string, NodeResult>): Resolved {
  const inputs: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const pin of kind.inputs) {
    const wire = into.get(pinKey(node.id, pin.name));
    if (wire) {
      const upstream = results.get(wire.from.node);
      if (upstream?.state !== "done") return { result: { state: "blocked", by: wire.from.node } };
      const given = kindOf.get(wire.from.node)?.outputs.find((output) => output.name === wire.from.pin);
      if (!given) return { result: { state: "failed", inputs, message: `${wire.from.node} gives no ${wire.from.pin}`, key: [] } };
      const made = handed(upstream.outputs[wire.from.pin], given.type, pin, kit);
      if ("refused" in made) return { result: { state: "failed", inputs, message: made.refused, key: [] } };
      inputs[pin.name] = made.value;
    } else if (node.values[pin.name] !== undefined) inputs[pin.name] = literalAs(pin.type, node.values[pin.name] as Literal);
    else if (pin.initial !== undefined) inputs[pin.name] = literalAs(pin.type, pin.initial);
    else if (!pin.optional) missing.push(pin.name);
  }
  return missing.length > 0 ? { result: { state: "missing", pins: missing } } : { inputs };
}

/** What flows out of one pin, made into what the input it is wired to takes. */
function handed(value: unknown, from: string, pin: InputPin, kit: Kit): { value: unknown } | { refused: string } {
  if (from === pin.type) return { value };
  const becomes = kit.types.get(from)?.becomes?.[pin.type];
  if (becomes) return { value: becomes(value) };
  const label = (type: string) => kit.types.get(type)?.label ?? type;
  return { refused: `${label(from)} cannot go into ${pin.label}, which takes ${label(pin.type)}` };
}

const same = (a: readonly unknown[], b: readonly unknown[]) => a.length === b.length && a.every((value, at) => Object.is(value, b[at]));

/** One line on what a node gave: its own words, or else its first output said as its type says things, or else what it painted. */
function saidOf(kind: NodeKind, ran: Ran, kit: Kit): string {
  if (ran.said !== undefined) return ran.said;
  const first = kind.outputs[0];
  if (first && ran.outputs && first.name in ran.outputs) return kit.types.get(first.type)?.describe(ran.outputs[first.name]) ?? "";
  return ran.painting?.caption ?? "";
}

/**
 * A blueprint run: every node, in an order where it comes after the nodes it
 * needs, handed what they gave. A node whose kind and inputs are the very
 * ones of the run before is not run again — what it gave is kept — so moving
 * a dial runs only what follows the dial. A node that throws says why; one
 * waiting for a file says which; and the nodes after either are held back.
 */
export function evaluateBlueprint(blueprint: Blueprint, kit: Kit, context: RunContext, before?: Evaluation): Evaluation {
  const results = new Map<string, NodeResult>();
  const surveyed: Surveyed = {
    into: new Map(blueprint.wires.map((wire) => [pinKey(wire.to.node, wire.to.pin), wire])),
    kindOf: new Map(blueprint.nodes.map((node) => [node.id, kit.kinds.get(node.kind)])),
  };
  const { order, circled } = ordered(blueprint);
  for (const node of circled) results.set(node.id, { state: "failed", inputs: {}, message: "it waits on itself, round a circle of wires", key: [] });
  for (const node of order) {
    const kind = kit.kinds.get(node.kind);
    if (!kind) {
      results.set(node.id, { state: "unknown" });
      continue;
    }
    const resolved = resolve(node, kind, surveyed, kit, results);
    if ("result" in resolved) {
      results.set(node.id, resolved.result);
      continue;
    }
    const { inputs } = resolved;
    const key = [kind, ...kind.inputs.map((pin) => inputs[pin.name])];
    const kept = before?.get(node.id);
    if ((kept?.state === "done" || kept?.state === "failed") && same(kept.key, key)) {
      results.set(node.id, kept);
      continue;
    }
    try {
      const ran = kind.run(inputs, context);
      results.set(node.id, { state: "done", inputs, outputs: ran.outputs ?? {}, painting: ran.painting, settled: ran.settled ?? {}, said: saidOf(kind, ran, kit), key });
    } catch (error) {
      if (error instanceof Pending) results.set(node.id, { state: "waiting", path: error.path });
      else results.set(node.id, { state: "failed", inputs, message: error instanceof Error ? error.message : String(error), key });
    }
  }
  return results;
}
