import type { Blueprint } from "./Blueprint";
import type { Evaluation } from "./Evaluation";
import { footOf } from "./footOf";
import type { Kit } from "./kitOf";
import { NODE } from "./NODE";
import type { Literal } from "./NodeKind";
import { nodeShapeOf } from "./nodeShapeOf";
import { resolvedEditor } from "./resolvedEditor";
import { saidBy } from "./saidBy";
import { type Markup, tag } from "./tag";
import { wirePath } from "./wirePath";

const MARGIN = 24;
/** About how many letters fit beside an input's label, and in a node's foot. */
const ROOM = { value: 18, foot: 36, note: 34 } as const;

const cut = (text: string, room: number) => (text.length > room ? `${text.slice(0, room - 1)}…` : text);
const colourOf = (kit: Kit, type: string) => `var(${kit.types.get(type)?.colour ?? "--dim"})`;

/** Words wrapped to lines of about so many letters. */
function wrapped(text: string, room: number): string[] {
  return text.split("\n").flatMap((paragraph) =>
    paragraph.split(" ").reduce<string[]>((lines, word) => {
      const last = lines.at(-1);
      if (last !== undefined && `${last} ${word}`.length <= room) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
      return lines;
    }, []),
  );
}

/**
 * A blueprint drawn as the canvas draws it, for the page before any script:
 * every node with its title, its outputs and its inputs, what is written on
 * each input, and the line at its foot; every wire in the colour of what
 * flows along it. Read off the HTML, it says what the program on the board
 * is made of.
 */
export function renderBlueprintSvg(blueprint: Blueprint, kit: Kit, evaluation: Evaluation, read: (path: string) => string): string {
  const shapes = new Map(blueprint.nodes.map((node) => [node.id, nodeShapeOf(kit.kinds.get(node.kind))]));
  const right = Math.max(0, ...blueprint.nodes.map((node) => node.x + NODE.width));
  const bottom = Math.max(0, ...blueprint.nodes.map((node) => node.y + (shapes.get(node.id)?.height ?? 0)));
  const [left, top] = [Math.min(0, ...blueprint.nodes.map((node) => node.x)), Math.min(0, ...blueprint.nodes.map((node) => node.y))];
  const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));

  const wires = blueprint.wires.flatMap(({ from, to }) => {
    const [a, b] = [byId.get(from.node), byId.get(to.node)];
    const out = a && shapes.get(a.id)?.outputs.get(from.pin);
    const into = b && shapes.get(b.id)?.inputs.get(to.pin);
    if (!a || !b || !out || !into) return [];
    const type = kit.kinds.get(a.kind)?.outputs.find((pin) => pin.name === from.pin)?.type ?? "value";
    return [tag("path", { class: "bp-wire", d: wirePath({ x: a.x + out.x, y: a.y + out.y }, { x: b.x + into.x, y: b.y + into.y }), style: `stroke: ${colourOf(kit, type)}` })];
  });

  const nodes = blueprint.nodes.map((node): Markup => {
    const kind = kit.kinds.get(node.kind);
    const shape = shapes.get(node.id) ?? nodeShapeOf(undefined);
    const result = evaluation.get(node.id);
    const settled = result?.state === "done" ? result.settled : {};
    const foot = footOf(result, node.kind);
    const wired = new Set(blueprint.wires.filter((wire) => wire.to.node === node.id).map((wire) => wire.to.pin));
    const outputs = (kind?.outputs ?? []).map((pin) => {
      const y = shape.outputs.get(pin.name)?.y ?? 0;
      return [tag("text", { class: "pin-label out", x: NODE.width - 12, y: y + 4, "text-anchor": "end" }, pin.label), tag("circle", { class: "pin", cx: NODE.width, cy: y, r: 4.5, style: `fill: ${colourOf(kit, pin.type)}` })];
    });
    const note = kind?.role === "note";
    const inputs = (kind?.inputs ?? []).map((pin) => {
      const y = shape.inputs.get(pin.name)?.y ?? 0;
      if (note) {
        const lines = wrapped(String(node.values[pin.name] ?? ""), ROOM.note).slice(0, (shape.rows.get(pin.name) ?? 1) + 1);
        return tag("text", { class: "note-text", x: 10, y: y - 2 }, lines.map((line, at) => tag("tspan", { x: 10, dy: at === 0 ? 0 : 15 }, line)));
      }
      const written = node.values[pin.name];
      const shown: { text: string; how: string } | null = wired.has(pin.name)
        ? null
        : written !== undefined
          ? { text: saidBy(resolvedEditor(node, pin, kit, read, evaluation), written), how: "written" }
          : settled[pin.name] !== undefined
            ? { text: `${String(settled[pin.name] as Literal)}`, how: "settled" }
            : pin.initial !== undefined
              ? { text: saidBy(resolvedEditor(node, pin, kit, read, evaluation), pin.initial), how: "initial" }
              : pin.optional
                ? null
                : { text: "—", how: "missing" };
      return [
        tag("circle", { class: wired.has(pin.name) ? "pin" : "pin open", cx: 0, cy: y, r: 4.5, style: `${wired.has(pin.name) ? "fill" : "stroke"}: ${colourOf(kit, pin.type)}` }),
        tag("text", { class: "pin-label in", x: 12, y: y + 4 }, pin.label),
        shown ? tag("text", { class: `value ${shown.how}`, x: NODE.width - 10, y: y + 4, "text-anchor": "end" }, cut(shown.text, ROOM.value)) : null,
      ];
    });
    return tag(
      "g",
      { class: `bp-node bp-role-${kind?.role ?? "unknown"}${foot.trouble ? " trouble" : ""}`, "data-node": node.id, transform: `translate(${node.x} ${node.y})` },
      tag("rect", { class: "body", width: NODE.width, height: shape.height, rx: 6 }),
      tag("path", { class: "head", d: `M0 ${NODE.header} V6 Q0 0 6 0 H${NODE.width - 6} Q${NODE.width} 0 ${NODE.width} 6 V${NODE.header} Z` }),
      tag("text", { class: "title", x: 10, y: 19 }, cut(node.title ?? kind?.title ?? node.kind, 30)),
      outputs,
      inputs,
      tag("text", { class: `foot${foot.trouble ? " trouble" : ""}`, x: 10, y: shape.height - 7 }, foot.said.length > ROOM.foot ? tag("title", {}, foot.said) : null, cut(foot.said, ROOM.foot)),
    );
  });

  const [width, height] = [right - left + MARGIN * 2, bottom - top + MARGIN * 2];
  return tag(
    "svg",
    { class: "bp-diagram", viewBox: `${left - MARGIN} ${top - MARGIN} ${width} ${height}`, role: "img", "aria-label": `A blueprint of ${blueprint.nodes.length} nodes and ${blueprint.wires.length} wires` },
    tag("g", { class: "wires" }, wires),
    tag("g", { class: "nodes" }, nodes),
  ).html;
}
