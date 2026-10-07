import { el } from "../../browser/el";
import type { Blueprint, PlacedNode, Wire } from "../../blueprint/Blueprint";
import { dialsOf } from "../../blueprint/dialsOf";
import { duplicated } from "../../blueprint/duplicated";
import type { Evaluation } from "../../blueprint/Evaluation";
import { evaluateBlueprint } from "../../blueprint/evaluateBlueprint";
import { footOf } from "../../blueprint/footOf";
import type { Example } from "../../blueprint/examplesOf";
import { freshId } from "../../blueprint/freshId";
import type { Kit } from "../../blueprint/kitOf";
import type { NodeKind } from "../../blueprint/NodeKind";
import { movedBy } from "../../blueprint/movedBy";
import { NODE } from "../../blueprint/NODE";
import type { Literal } from "../../blueprint/NodeKind";
import { nodeShapeOf } from "../../blueprint/nodeShapeOf";
import { parseBlueprint } from "../../blueprint/parseBlueprint";
import { peekOf } from "../../blueprint/peekOf";
import { printBlueprint } from "../../blueprint/printBlueprint";
import { resolvedEditor } from "../../blueprint/resolvedEditor";
import { type Suggestion, suggestionsFor } from "../../blueprint/suggestionsFor";
import { tag } from "../../blueprint/tag";
import { tidyBlueprint } from "../../blueprint/tidyBlueprint";
import { wirePath } from "../../blueprint/wirePath";
import { wireRefused } from "../../blueprint/wireRefused";
import { withNode } from "../../blueprint/withNode";
import { withoutNodes } from "../../blueprint/withoutNodes";
import { withoutWires } from "../../blueprint/withoutWires";
import { withTitle } from "../../blueprint/withTitle";
import { withValue } from "../../blueprint/withValue";
import { withWire } from "../../blueprint/withWire";
import { boundsOf } from "../boundsOf";
import { Camera } from "../Camera";
import { EditHistory } from "../EditHistory";
import type { Dragged, Offer } from "../kindsFor";
import { pinAt, type PinFound } from "../pinAt";
import { BoardView, type Card } from "./BoardView";
import type { FilesInBrowser } from "./FilesInBrowser";
import { NodeView } from "./NodeView";
import { openExamples } from "./openExamples";
import { openHelp } from "./openHelp";
import { openKindMenu } from "./openKindMenu";
import { openPeek } from "./openPeek";
import { openTextPanel } from "./openTextPanel";

/** Where a workbench stands, and what it is handed. */
export interface WorkbenchSetting {
  readonly kit: Kit;
  readonly files: FilesInBrowser;
  /** The blueprints the page writes: the first is the one it opens on, any of them can be opened, and Reset goes back to the one open. */
  readonly examples: readonly Example[];
  /** Where to start instead: another of the examples, or a version of it a link carried, and what to say about that. */
  readonly start?: { readonly example?: Example; readonly text?: string; readonly said?: string };
  /** The board the build wrote, shown until the blueprint has run here: the pictures do not blink out while it does. */
  readonly stillBoard?: string;
  /** The reader's own version of each example, told after every edit, and told nothing when it is the example again. */
  readonly own: { get(example: Example): string | null; set(example: Example, text: string | null): void };
  /** Told which example is open, once the reader opens another, so that the address can say it. */
  opened?(example: Example): void;
  /** Whether a flag is on: a kind on trial is offered only while its own is. */
  isOn?(flag: string): boolean;
  /** A link that opens this blueprint as it now is, a version of the example it came from. */
  linkTo(example: Example, text: string): string;
  copy(text: string): Promise<void>;
}

type Gesture =
  | { readonly kind: "pan"; readonly x: number; readonly y: number; readonly from: { x: number; y: number }; moved: boolean }
  | { readonly kind: "move"; readonly ids: readonly string[]; readonly from: { x: number; y: number }; readonly before: Blueprint; moved: boolean }
  | { readonly kind: "wire"; readonly end: PinFound; readonly type: string; at: { x: number; y: number }; readonly detached: Wire | null; readonly before: Blueprint }
  | { readonly kind: "marquee"; readonly from: { x: number; y: number }; at: { x: number; y: number }; readonly base: ReadonlySet<string> };

const SVG = "http://www.w3.org/2000/svg";
/** How wide the menu is with its words beside its list, and how wide a canvas has to be to have room for it. */
const MENU = { narrow: 280, side: 580 };
const KEPT = "As you left it: your changes are kept in this browser. Reset goes back to the page's own.";
const NONE: Example = { title: "", slug: "", about: "", text: "" };
const HINT = {
  fine: "Drag a pin to wire it; drop a wire in empty space to add what comes next. Double-click the canvas to add a node.",
  touch: "Open it full screen to work on it with your fingers.",
};

/**
 * A blueprint worked on in the page: the canvas, where its nodes stand and
 * its wires run, and the board, with its dials and its pictures. Every edit
 * is a new blueprint, kept for undoing; every blueprint is run again at once,
 * only what changed running; and a file still on its way is waited for. The
 * hands are Unreal's: drag from a pin to wire it, drop a wire in empty space
 * for the menu of what fits, drag a node by its title, drag the canvas to
 * move about, and Ctrl and the wheel to zoom.
 */
export class Workbench {
  readonly element: HTMLElement;
  private history: EditHistory<Blueprint>;
  /** The example open, and the blueprint it is, which Reset goes back to. */
  private chosen: Example;
  private original: Blueprint;
  /** The board the build wrote, while it is still the board of what is open. */
  private still: string | undefined;
  private evaluation: Evaluation = new Map();
  private preview: Blueprint | null = null;
  private selection = new Set<string>();
  private chosenWire: Wire | null = null;
  private gesture: Gesture | null = null;
  private readonly camera = new Camera();
  private readonly canvas: HTMLElement;
  private readonly world: HTMLElement;
  private readonly wires: SVGSVGElement;
  private readonly nodes: HTMLElement;
  private readonly marquee: HTMLElement;
  /** What could come after the chosen node, a click away. */
  private readonly next: HTMLElement;
  private nextShown = "";
  private readonly status: HTMLElement;
  private readonly about: HTMLElement;
  private readonly board: BoardView;
  private readonly views = new Map<string, NodeView>();
  private readonly buttons: Record<"undo" | "redo" | "reset" | "full", HTMLButtonElement>;
  private closeMenu: (() => void) | null = null;
  private closePeek: (() => void) | null = null;
  private scheduled = false;
  private stopped = false;
  /** Run only once it is near the screen: a page of blueprints does not run all of them for a reader who reads the first. */
  private awake = false;
  private ran = false;
  private notice: string;
  private readonly stopListening: () => void;
  private pinches = new Map<number, { x: number; y: number }>();
  /** The examples each kind of node is found in, worked out the first time the menu asks. */
  private seen: Map<string, string[]> | null = null;

  constructor(private readonly setting: WorkbenchSetting) {
    this.chosen = setting.start?.example ?? setting.examples[0] ?? NONE;
    this.original = this.laidOut(this.chosen.text);
    const own = setting.start?.text ?? setting.own.get(this.chosen);
    this.history = new EditHistory(own ? this.laidOut(own) : this.original);
    this.notice = setting.start?.said ?? (own ? KEPT : "");
    this.still = this.chosen === setting.examples[0] && !own ? setting.stillBoard : undefined;

    this.wires = document.createElementNS(SVG, "svg");
    this.wires.classList.add("wb-wires");
    this.nodes = el("div", { class: "wb-nodes" });
    this.world = el("div", { class: "wb-world" }, this.wires, this.nodes);
    this.marquee = el("div", { class: "wb-marquee", hidden: true });
    this.next = el("div", { class: "wb-next", role: "toolbar", "aria-label": "What could come next" });
    this.canvas = el("div", { class: "wb-canvas", tabindex: 0, role: "application", "aria-label": "The blueprint's canvas: its nodes and wires" }, this.world, this.marquee, this.next, el("p", { class: "wb-blank" }, "An empty blueprint. Double-click here, or press the space bar, to add a node."));
    this.status = el("p", { class: "wb-status", "aria-live": "polite" });
    this.about = el("p", { class: "bp-about wb-about" });
    this.board = new BoardView({
      turn: (node, value, done) => this.write(node, "value", value, done),
      find: (node) => this.find(node),
      point: (node) => this.point(node),
      rename: (node, title) => this.edit(withTitle(this.history.now, node, title)),
    });

    const button = (label: string, title: string, act: () => void, extra = "") => {
      const made = el("button", { type: "button", title, "aria-label": title, class: extra }, label);
      made.addEventListener("click", act);
      return made;
    };
    this.buttons = {
      undo: button("Undo", "Undo (Ctrl+Z)", () => this.step("undo")),
      redo: button("Redo", "Redo (Ctrl+Shift+Z)", () => this.step("redo")),
      reset: button("Reset", "Go back to the blueprint as the page wrote it", () => this.reset()),
      full: button("Full screen", "Work on it full screen (Esc to come back)", () => this.toggleFull(), "wb-full-button"),
    };
    const examples = setting.examples.length > 1 ? [button("Examples", "Open another of the page's blueprints here", () => this.toggleExamples(), "wb-examples-button")] : [];
    const bar = el(
      "div",
      { class: "wb-bar", role: "toolbar", "aria-label": "Blueprint" },
      ...examples,
      button("＋ Node", "Add a node (space bar)", () => this.openMenu(null, undefined), "wb-add"),
      this.buttons.undo,
      this.buttons.redo,
      button("Tidy", "Lay the nodes out again, as the data flows", () => this.tidy()),
      button("Fit", "Bring the whole blueprint into view (F)", () => this.fit()),
      button("Text", "The blueprint as text, to read, copy or write", () => this.openText()),
      button("Link", "Copy a link to the blueprint as it is now", () => void this.share()),
      this.buttons.reset,
      button("?", "How to use it", () => this.toggleHelp(), "wb-help-button"),
      this.buttons.full,
    );
    this.element = el("div", { class: "workbench" }, bar, this.about, el("div", { class: "wb-main" }, el("div", { class: "wb-stage" }, this.canvas, this.status), this.board.element));
    // The stylesheet draws a node at the sizes a wire is drawn to: it is told them, so the two cannot drift apart.
    for (const [name, size] of Object.entries(NODE)) this.element.style.setProperty(`--bp-${name}`, `${size}px`);

    this.listen();
    this.stopListening = setting.files.listen(() => this.schedule());
    if (this.still) this.board.showStill(this.still);
    this.tellAbout();
    this.render();
  }

  /** One of the page's examples, open here: as the reader left it, if they did, and Reset going back to it. */
  open(example: Example): void {
    if (example === this.chosen) return;
    this.closeMenu?.();
    this.element.querySelector(".wb-examples")?.remove();
    this.chosen = example;
    this.original = this.laidOut(example.text);
    this.still = undefined;
    // What the one before made is not this one's: a node called as one of its nodes was may be another kind of node.
    this.evaluation = new Map();
    const own = this.setting.own.get(example);
    this.history = new EditHistory(own ? this.laidOut(own) : this.original);
    this.preview = null;
    this.selection.clear();
    this.tellAbout();
    this.changed();
    this.notice = own ? KEPT : `Opened here: ${example.title}`;
    this.setting.opened?.(example);
    this.wake();
    this.fit();
    this.say();
  }

  /** What the example open is called, and what it is about, above the canvas. */
  private tellAbout(): void {
    const { title, about } = this.chosen;
    this.about.hidden = !title;
    this.about.title = about;
    this.about.replaceChildren(el("strong", {}, title), about ? ` ${about}` : "");
  }

  /** A blueprint written by someone else — an agent — put on the canvas as an edit, so that Undo and Reset still work. */
  ask(text: string): void {
    this.edit(this.laidOut(text));
    this.notice = "Written by an agent. Undo, or Reset, goes back.";
    this.wake();
    this.fit();
    this.say();
  }

  /** Near the screen: run the blueprint, and from now on whenever it changes. */
  wake(): void {
    this.awake = true;
    this.schedule();
  }

  /** The blueprint shown: being dragged, or as it stands. */
  private get blueprint(): Blueprint {
    return this.preview ?? this.history.now;
  }

  /** Put on the page, and looking at all of it. */
  placed(): void {
    this.fit();
  }

  stop(): void {
    this.stopped = true;
    this.stopListening();
    this.closeMenu?.();
    this.closePeek?.();
    document.body.classList.remove("wb-full-open");
  }

  /** A blueprint from its text, tidied when the text does not say where its nodes stand. */
  private laidOut(text: string): Blueprint {
    const { blueprint, placed } = parseBlueprint(text, this.setting.kit);
    return placed ? blueprint : tidyBlueprint(blueprint, this.setting.kit);
  }

  /** A new blueprint, kept for undoing — joined with the edit before when they have one key — drawn, kept, and run. */
  private edit(next: Blueprint, key?: string): void {
    this.preview = null;
    this.history.push(next, key);
    this.notice = "";
    this.changed();
  }

  private changed(): void {
    const now = this.history.now;
    const nodes = new Set(now.nodes.map((node) => node.id));
    this.selection = new Set([...this.selection].filter((id) => nodes.has(id)));
    this.setting.own.set(this.chosen, now === this.original ? null : printBlueprint(now, this.setting.kit));
    this.render();
    this.schedule();
  }

  private step(way: "undo" | "redo"): void {
    if (way === "undo") this.history.undo();
    else this.history.redo();
    this.preview = null;
    this.changed();
  }

  private reset(): void {
    this.history.push(this.original);
    this.notice = "Back to the blueprint as the page wrote it.";
    this.changed();
    this.fit();
  }

  /** Run the blueprint soon — once, however many edits come before — so a slider dragged runs it once a frame, not once an event. */
  private schedule(): void {
    if (this.scheduled || this.stopped || !this.awake) return;
    this.scheduled = true;
    setTimeout(() => {
      this.scheduled = false;
      if (this.stopped) return;
      this.evaluation = evaluateBlueprint(this.history.now, this.setting.kit, { read: this.setting.files.read }, this.evaluation);
      // The board the build wrote stays until every picture can be drawn here: it would only blink out into "fetching".
      this.ran ||= [...this.evaluation.values()].every((result) => result.state !== "waiting");
      this.render();
    }, 0);
  }

  // ---- drawing

  private render(): void {
    const blueprint = this.blueprint;
    const { kit, files } = this.setting;
    const dials = new Map(dialsOf(blueprint, kit, files.read, this.evaluation).map((dial) => [dial.node, dial]));
    const seen = new Set<string>();
    for (const node of blueprint.nodes) {
      seen.add(node.id);
      let view = this.views.get(node.id);
      if (!view) {
        view = new NodeView(kit, node.id, {
          write: (id, pin, value, done) => this.write(id, pin, value, done),
          promote: (id, pin) => this.promote(id, pin),
          rename: (id, title) => this.edit(withTitle(this.history.now, id, title)),
          peek: (id, pin, anchor) => this.peek(id, pin, anchor),
        });
        this.views.set(node.id, view);
        this.nodes.append(view.element);
      }
      const dial = dials.get(node.id);
      view.show({
        node,
        result: this.evaluation.get(node.id),
        wiredIn: this.wiredInto(node.id),
        wiredOut: this.wiredOutOf(node.id),
        editors: dial ? new Map([["value", dial.editor]]) : this.editorsOf(node),
        selected: this.selection.has(node.id),
        // A dial says what it is set to as the board does: a station by its name, not its code.
        ...(dial && { foot: `on the board: ${dial.said}` }),
      });
    }
    for (const [id, view] of this.views)
      if (!seen.has(id)) {
        view.element.remove();
        this.views.delete(id);
      }
    this.drawWires();
    if (!this.gesture) this.offerNext();
    if (this.ran || !this.still) this.drawBoard();
    this.canvas.classList.toggle("blank", blueprint.nodes.length === 0);
    this.buttons.undo.disabled = !this.history.canUndo;
    this.buttons.redo.disabled = !this.history.canRedo;
    this.buttons.reset.disabled = this.history.now === this.original;
    if (!this.gesture) this.say();
  }

  private wiredInto(id: string): Set<string> {
    return new Set(this.blueprint.wires.filter((wire) => wire.to.node === id).map((wire) => wire.to.pin));
  }

  private wiredOutOf(id: string): Set<string> {
    return new Set(this.blueprint.wires.filter((wire) => wire.from.node === id).map((wire) => wire.from.pin));
  }

  /** How each input of a node is written, as its kind says, worked out from what it was handed. */
  private editorsOf(node: PlacedNode): Map<string, ReturnType<typeof resolvedEditor>> {
    const { kit, files } = this.setting;
    return new Map((kit.kinds.get(node.kind)?.inputs ?? []).map((pin) => [pin.name, resolvedEditor(node, pin, kit, files.read, this.evaluation)]));
  }

  private drawWires(): void {
    const { kit } = this.setting;
    const blueprint = this.blueprint;
    const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));
    const pinPoint = (id: string, pin: string, side: "inputs" | "outputs") => {
      const node = byId.get(id);
      const at = node && nodeShapeOf(kit.kinds.get(node.kind))[side].get(pin);
      return node && at ? { x: node.x + at.x, y: node.y + at.y } : null;
    };
    const typeOut = (id: string, pin: string) => kit.kinds.get(byId.get(id)?.kind ?? "")?.outputs.find((output) => output.name === pin)?.type ?? "value";
    const paths: SVGElement[] = [];
    for (const wire of blueprint.wires) {
      const [from, to] = [pinPoint(wire.from.node, wire.from.pin, "outputs"), pinPoint(wire.to.node, wire.to.pin, "inputs")];
      if (!from || !to) continue;
      const d = wirePath(from, to);
      const chosen = this.chosenWire?.to.node === wire.to.node && this.chosenWire.to.pin === wire.to.pin;
      const waiting = this.evaluation.get(wire.from.node)?.state !== "done";
      paths.push(this.path(d, `wb-wire${chosen ? " chosen" : ""}${waiting ? " idle" : ""}`, kit.types.get(typeOut(wire.from.node, wire.from.pin))?.colour));
      const hit = this.path(d, "wb-wire-hit");
      hit.dataset["to"] = `${wire.to.node}\u0000${wire.to.pin}`;
      const said = this.carried(wire);
      if (said) hit.append(Object.assign(document.createElementNS(SVG, "title"), { textContent: said }));
      paths.push(hit);
    }
    const gesture = this.gesture;
    if (gesture?.kind === "wire") {
      const fixed = pinPoint(gesture.end.node, gesture.end.pin, gesture.end.side === "output" ? "outputs" : "inputs");
      if (fixed) paths.push(this.path(gesture.end.side === "output" ? wirePath(fixed, gesture.at) : wirePath(gesture.at, fixed), "wb-wire dragging", kit.types.get(gesture.type)?.colour));
    }
    this.wires.replaceChildren(...paths);
  }

  /** What could come after the one node chosen, read off what it gave: built again only when that changes, so a button is never pulled from under a hand. */
  private offerNext(): void {
    const [chosen] = this.selection.size === 1 ? [...this.selection] : [];
    const offered = chosen ? suggestionsFor(this.history.now, chosen, this.setting.kit, this.evaluation).filter((offer) => this.offers(this.setting.kit.kinds.get(offer.kind))) : [];
    const shown = `${chosen}\u0000${offered.map((each) => each.label).join("\u0000")}`;
    this.next.hidden = offered.length === 0;
    if (shown === this.nextShown) return;
    this.nextShown = shown;
    this.next.replaceChildren(
      el("span", { class: "wb-next-said" }, "Next:"),
      ...offered.map((offer) => {
        const take = el("button", { type: "button", title: `Add it, wired from what is chosen: ${this.setting.kit.kinds.get(offer.kind)?.title ?? offer.kind}` }, offer.label);
        take.addEventListener("click", () => chosen && this.follow(chosen, offer));
        return take;
      }),
    );
  }

  /** A next step taken: its node added to the right of the one it follows, wired from it, written as offered, and chosen — so what could come after it is offered in turn. */
  private follow(id: string, offer: Suggestion): void {
    const { kit } = this.setting;
    const now = this.history.now;
    const after = now.nodes.find((node) => node.id === id);
    if (!after) return;
    const shape = nodeShapeOf(kit.kinds.get(offer.kind));
    const at = this.freeSpot({ x: after.x + nodeShapeOf(kit.kinds.get(after.kind)).width + 80, y: after.y }, shape.width, shape.height);
    const node: PlacedNode = { id: freshId(now, offer.kind), kind: offer.kind, ...at, values: offer.values };
    let next = withWire(withNode(now, node), { from: { node: id, pin: offer.from }, to: { node: node.id, pin: offer.into } });
    if (offer.also) next = withWire(next, { from: offer.also.from, to: { node: node.id, pin: offer.also.into } });
    this.selection = new Set([node.id]);
    this.edit(next);
    this.reveal([node.id]);
    this.notice = `${offer.label}: added, wired from what was chosen. What could come after it is offered in turn.`;
    this.say();
  }

  /** What a wire carries, in words, for whoever points at it — and, where the input takes it as something else, as what: a graph read as a table. */
  private carried(wire: Wire): string | null {
    const { kit } = this.setting;
    const result = this.evaluation.get(wire.from.node);
    if (result?.state !== "done" || !(wire.from.pin in result.outputs)) return null;
    const kindOf = (id: string) => kit.kinds.get(this.blueprint.nodes.find((node) => node.id === id)?.kind ?? "");
    const out = kindOf(wire.from.node)?.outputs.find((pin) => pin.name === wire.from.pin)?.type ?? "value";
    const into = kindOf(wire.to.node)?.inputs.find((pin) => pin.name === wire.to.pin)?.type;
    const type = kit.types.get(out);
    const read = into && into !== out ? `, read here as ${kit.types.get(into)?.label ?? into}` : "";
    return `${type?.label ?? out}: ${type ? type.describe(result.outputs[wire.from.pin]) : ""}${read}`;
  }

  /** What one output of a node gives, beside it: what it is in words, its first rows, and what its columns are. */
  private peek(id: string, pin: string, anchor: Element): void {
    const { kit } = this.setting;
    const node = this.history.now.nodes.find((each) => each.id === id);
    const output = kit.kinds.get(node?.kind ?? "")?.outputs.find((each) => each.name === pin);
    if (!node || !output) return;
    const result = this.evaluation.get(id);
    const html = result?.state === "done" && pin in result.outputs ? peekOf(result.outputs[pin], output.type, kit).html : tag("p", {}, footOf(result, node.kind).said || "It has not run yet.").html;
    this.closePeek?.();
    this.closePeek = openPeek(this.canvas, `${node.title ?? kit.kinds.get(node.kind)?.title ?? node.kind} gives ${output.label}`, html, anchor);
  }

  private path(d: string, className: string, colour?: string): SVGElement {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", className);
    if (colour) path.style.setProperty("--pin", `var(${colour})`);
    return path;
  }

  private drawBoard(): void {
    const { kit, files } = this.setting;
    const blueprint = this.history.now;
    const painters = blueprint.nodes.filter((node) => kit.kinds.get(node.kind)?.role === "paint");
    const cards = painters.map((node): Card => {
      const result = this.evaluation.get(node.id);
      const title = node.title ?? kit.kinds.get(node.kind)?.title ?? node.kind;
      if (result?.state === "done" && result.painting) return { node: node.id, title, painting: result.painting };
      if (result?.state === "failed") return { node: node.id, title, problem: result.message };
      if (result?.state === "missing") return { node: node.id, title, problem: `Wire a ${result.pins.join(" and a ")} into it.` };
      return { node: node.id, title, waiting: true };
    });
    this.board.show(dialsOf(blueprint, kit, files.read, this.evaluation), cards);
  }

  private applyCamera(): void {
    const { x, y, zoom } = this.camera;
    this.world.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    this.canvas.style.setProperty("--wb-x", `${x}px`);
    this.canvas.style.setProperty("--wb-y", `${y}px`);
    this.canvas.style.setProperty("--wb-zoom", String(zoom));
  }

  private fit(): void {
    const bounds = boundsOf(this.history.now, this.setting.kit);
    const box = this.canvas.getBoundingClientRect();
    if (bounds) this.camera.fit(bounds, { width: box.width, height: box.height });
    this.applyCamera();
  }

  /** The line under the canvas: what was just done or refused, or how to begin. */
  private say(words?: string): void {
    this.status.textContent = words ?? (this.notice || (this.touching() && !this.full() ? HINT.touch : HINT.fine));
  }

  // ---- what hands do to the blueprint

  private write(id: string, pin: string, value: Literal | undefined, done: boolean): void {
    const next = withValue(this.history.now, id, pin, value);
    this.edit(next, done ? undefined : `${id}\u0000${pin}`);
  }

  /** An input put on the board: a dial wired into it, standing to its left, holding what the input holds now. */
  private promote(id: string, pin: string): void {
    const now = this.history.now;
    const node = now.nodes.find((each) => each.id === id);
    const kind = node && this.setting.kit.kinds.get(node.kind);
    const input = kind?.inputs.find((each) => each.name === pin);
    if (!node || !input) return;
    const result = this.evaluation.get(id);
    const settled = result?.state === "done" ? result.settled[pin] : undefined;
    const value = node.values[pin] ?? settled ?? input.initial ?? (input.type === "number" ? 0 : input.type === "flag" ? false : "");
    const dialId = freshId(now, pin.replace(/[^\w-]/g, "") || "dial");
    const row = nodeShapeOf(kind).inputs.get(pin)?.y ?? 0;
    // Beside the input it turns, its wire level with it, moved off any node it would stand on.
    const wanted = { x: node.x - NODE.dial - 48, y: node.y + row - (NODE.header + NODE.row / 2) };
    const dial: PlacedNode = { id: dialId, kind: "dial", ...this.freeSpot(wanted, NODE.dial, nodeShapeOf(this.setting.kit.kinds.get("dial")).height), title: input.label || pin, values: { value } };
    this.selection = new Set([dialId]);
    this.edit(withWire(withValue(withNode(now, dial), id, pin, undefined), { from: { node: dialId, pin: "value" }, to: { node: id, pin } }));
    this.reveal([dialId, id]);
    this.say(`${input.label || pin} is on the board now, as a dial — and on the canvas, beside the node it turns.`);
  }

  private tidy(): void {
    this.edit(tidyBlueprint(this.history.now, this.setting.kit));
    this.fit();
  }

  private remove(): void {
    if (this.selection.size > 0) this.edit(withoutNodes(this.history.now, [...this.selection]));
    else if (this.chosenWire) {
      this.edit(withoutWires(this.history.now, this.chosenWire.to, "input"));
      this.chosenWire = null;
    }
  }

  private duplicate(): void {
    if (this.selection.size === 0) return;
    const { blueprint, ids } = duplicated(this.history.now, [...this.selection], 30);
    this.selection = new Set(ids);
    this.edit(blueprint);
  }

  /** The node a dial or a picture of the board comes from, lit on the canvas while it is pointed at, and said. */
  private point(id: string | null): void {
    for (const [each, view] of this.views) view.element.classList.toggle("pointed", each === id);
    const node = id ? this.history.now.nodes.find((each) => each.id === id) : undefined;
    const kind = node && this.setting.kit.kinds.get(node.kind);
    if (!node || !kind) return this.say();
    const into = this.history.now.wires.filter((wire) => wire.from.node === node.id).map((wire) => {
      const target = this.history.now.nodes.find((each) => each.id === wire.to.node);
      return `${wire.to.pin} of ${target?.title ?? this.setting.kit.kinds.get(target?.kind ?? "")?.title ?? wire.to.node}`;
    });
    this.say(kind.role === "dial" ? `${node.title ?? "This dial"} turns ${into.join(" and ") || "nothing yet: wire it into an input"}. It is lit on the canvas.` : `${node.title ?? kind.title} comes from the ${kind.title} node lit on the canvas.`);
  }

  /** A node brought into view and chosen: what a picture's title on the board does. */
  private find(id: string): void {
    const node = this.history.now.nodes.find((each) => each.id === id);
    if (!node) return;
    this.selection = new Set([id]);
    const box = this.canvas.getBoundingClientRect();
    this.camera.x = box.width / 2 - (node.x + NODE.width / 2) * this.camera.zoom;
    this.camera.y = box.height / 2 - (node.y + 60) * this.camera.zoom;
    this.applyCamera();
    this.render();
    this.canvas.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }

  /** The menu of kinds, where asked: chosen, the node stands there, wired to the wire being dragged if one was. */
  private openMenu(at: { x: number; y: number } | null, dragged: Dragged | undefined, end?: PinFound, detached?: Wire | null): void {
    this.closeMenu?.();
    const box = this.canvas.getBoundingClientRect();
    const world = at ?? this.camera.toWorld(box.width / 2 - NODE.width / 2, box.height / 4);
    const screen = { left: world.x * this.camera.zoom + this.camera.x, top: world.y * this.camera.zoom + this.camera.y };
    // Never taller than the canvas has room for under where it opens, and opened high enough to have room for most of it.
    const top = Math.max(6, Math.min(screen.top, box.height - 280));
    const height = Math.max(200, Math.min(420, box.height - top - 8));
    // Beside the list, what a kind does has room to be said whole; on a narrow canvas, it is said under it.
    const side = box.width >= MENU.side + 16;
    let taken = false;
    this.say(dragged ? "Choose what comes next, typing to narrow it; Escape lets the wire go." : "Choose a node, typing to narrow it; Escape closes the menu.");
    this.closeMenu = openKindMenu(
      this.canvas,
      this.offeredKit(),
      { left: Math.max(4, Math.min(screen.left, box.width - (side ? MENU.side : MENU.narrow))), top, ...(box.height > 0 && { height }), side },
      dragged,
      (offer) => {
        taken = true;
        this.add(offer, world, end, at === null);
      },
      () => {
        this.closeMenu = null;
        // A wire pulled off its input and dropped where nothing was chosen is let go: that is how a wire is taken away by hand.
        if (!taken && detached) this.edit(withoutWires(this.history.now, detached.to, "input"));
        else if (!taken) this.preview = null;
        this.render();
        this.canvas.focus({ preventScroll: true });
      },
      (kind) => this.seenIn(kind.name),
    );
  }

  /** Whether a kind is offered to be added: every kind, but one on trial while its flag is off. */
  private offers(kind: NodeKind | undefined): boolean {
    return kind !== undefined && (kind.flag === undefined || this.setting.isOn?.(kind.flag) === true);
  }

  /** The kit as the menu offers it: asked for each time, since a flag can be switched while the page is open. */
  private offeredKit(): Kit {
    const { kit } = this.setting;
    return { kinds: new Map([...kit.kinds].filter(([, kind]) => this.offers(kind))), types: kit.types };
  }

  /** The page's examples a kind of node is found in: where to see it at work. */
  private seenIn(kind: string): readonly string[] {
    if (!this.seen) {
      this.seen = new Map();
      for (const example of this.setting.examples)
        for (const name of new Set(parseBlueprint(example.text, this.setting.kit).blueprint.nodes.map((node) => node.kind))) this.seen.set(name, [...(this.seen.get(name) ?? []), example.title]);
    }
    return this.seen.get(kind) ?? [];
  }

  private add(offer: Offer, at: { x: number; y: number }, end?: PinFound, free = false): void {
    const now = this.history.now;
    const id = freshId(now, offer.kind.name);
    const shape = nodeShapeOf(offer.kind);
    const asked = { x: Math.round(end?.side === "input" ? at.x - shape.width : at.x), y: Math.round(at.y - NODE.header / 2) };
    const node: PlacedNode = { id, kind: offer.kind.name, ...(free ? this.freeSpot(asked, shape.width, shape.height) : asked), values: {} };
    let next = withNode(now, node);
    if (end && offer.pin) next = withWire(next, end.side === "output" ? { from: { node: end.node, pin: end.pin }, to: { node: id, pin: offer.pin } } : { from: { node: id, pin: offer.pin }, to: { node: end.node, pin: end.pin } });
    this.selection = new Set([id]);
    this.edit(next);
    this.reveal([id]);
  }

  /** The nearest place to one asked for where a node that big stands on no other: tried further down, then further up, a node's row at a time. */
  private freeSpot(asked: { x: number; y: number }, width: number, height: number): { x: number; y: number } {
    const { kit } = this.setting;
    const boxes = this.history.now.nodes.map((node) => ({ node, shape: nodeShapeOf(kit.kinds.get(node.kind)) }));
    const clear = (y: number) => boxes.every(({ node, shape }) => asked.x + width + 12 <= node.x || node.x + shape.width + 12 <= asked.x || y + height + 12 <= node.y || node.y + shape.height + 12 <= y);
    for (let step = 0; step < 40; step += 1) {
      const y = asked.y + (step % 2 === 0 ? 1 : -1) * Math.ceil(step / 2) * NODE.row * 2;
      if (clear(y)) return { x: Math.round(asked.x), y: Math.round(y) };
    }
    return { x: Math.round(asked.x), y: Math.round(asked.y) };
  }

  /** Some nodes brought into view, the canvas moved no more than it has to: a node added out of sight is a node not added, for whoever is looking. */
  private reveal(ids: readonly string[]): void {
    const { kit } = this.setting;
    const nodes = this.history.now.nodes.filter((node) => ids.includes(node.id));
    if (nodes.length === 0) return;
    const box = this.canvas.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return;
    const { zoom } = this.camera;
    const left = Math.min(...nodes.map((node) => node.x)) * zoom + this.camera.x;
    const top = Math.min(...nodes.map((node) => node.y)) * zoom + this.camera.y;
    const right = Math.max(...nodes.map((node) => node.x + nodeShapeOf(kit.kinds.get(node.kind)).width)) * zoom + this.camera.x;
    const bottom = Math.max(...nodes.map((node) => node.y + nodeShapeOf(kit.kinds.get(node.kind)).height)) * zoom + this.camera.y;
    const margin = 24;
    if (left < margin) this.camera.x += margin - left;
    else if (right > box.width - margin) this.camera.x -= Math.min(right - (box.width - margin), left - margin);
    if (top < margin) this.camera.y += margin - top;
    else if (bottom > box.height - margin) this.camera.y -= Math.min(bottom - (box.height - margin), top - margin);
    this.applyCamera();
  }

  private openText(): void {
    openTextPanel(this.element, printBlueprint(this.history.now, this.setting.kit, { positions: false }), this.setting.kit, (text) => {
      const { blueprint } = parseBlueprint(text, this.setting.kit);
      const before = new Map(this.history.now.nodes.map((node) => [node.id, node]));
      const kept = blueprint.nodes.every((node) => before.has(node.id));
      this.edit(kept ? { ...blueprint, nodes: blueprint.nodes.map((node) => ({ ...node, x: before.get(node.id)?.x ?? 0, y: before.get(node.id)?.y ?? 0 })) } : tidyBlueprint(blueprint, this.setting.kit));
      if (!kept) this.fit();
    });
  }

  private async share(): Promise<void> {
    const link = this.setting.linkTo(this.chosen, printBlueprint(this.history.now, this.setting.kit));
    try {
      await this.setting.copy(link);
      this.say("A link to this blueprint, as it is now, is copied: whoever opens it sees it so.");
    } catch {
      this.say(link);
    }
  }

  /** The page's blueprints, to open any of them here; pressed again, put away. */
  private toggleExamples(): void {
    const open = this.element.querySelector(".wb-examples");
    if (open) open.remove();
    else openExamples(this.element, this.setting.examples, this.chosen, (example) => this.open(example));
  }

  /** What the hands do, said where the hands are; pressed again, put away. */
  private toggleHelp(): void {
    const open = this.element.querySelector(".wb-help");
    if (open) open.remove();
    else openHelp(this.element);
  }

  private full(): boolean {
    return this.element.classList.contains("full");
  }

  private touching(): boolean {
    return window.matchMedia?.("(pointer: coarse)").matches ?? false;
  }

  private toggleFull(): void {
    const full = !this.full();
    this.element.classList.toggle("full", full);
    document.body.classList.toggle("wb-full-open", full);
    this.buttons.full.textContent = full ? "Back to the page" : "Full screen";
    this.buttons.full.title = full ? "Back to the page (Esc)" : "Work on it full screen (Esc to come back)";
    // Fitted once the stylesheet has given the canvas its new size.
    setTimeout(() => this.fit(), 0);
    this.say();
  }

  // ---- hands on the canvas

  private listen(): void {
    const canvas = this.canvas;
    canvas.addEventListener("pointerdown", (event) => this.pressed(event));
    canvas.addEventListener("pointermove", (event) => this.moved(event));
    canvas.addEventListener("pointerup", (event) => this.released(event));
    canvas.addEventListener("pointercancel", (event) => {
      this.pinches.delete(event.pointerId);
      this.gesture = null;
      this.preview = null;
      this.clearFits();
      this.render();
    });
    canvas.addEventListener("dblclick", (event) => {
      if (this.onBackground(event.target)) this.openMenu(this.pointOf(event), undefined);
    });
    canvas.addEventListener("contextmenu", (event) => {
      if (!this.onBackground(event.target)) return;
      event.preventDefault();
      this.openMenu(this.pointOf(event), undefined);
    });
    canvas.addEventListener(
      "wheel",
      (event) => {
        // A menu, or anything else that scrolls inside the canvas, scrolls itself.
        if ((event.target as Element).closest(".wb-menu")) return;
        const box = canvas.getBoundingClientRect();
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.camera.zoomAt(event.clientX - box.left, event.clientY - box.top, Math.exp(-event.deltaY / 300));
        } else if (this.full()) {
          event.preventDefault();
          this.camera.x -= event.deltaX;
          this.camera.y -= event.deltaY;
        } else return;
        this.applyCamera();
      },
      { passive: false },
    );
    canvas.addEventListener("keydown", (event) => this.keyed(event));
    canvas.addEventListener("pointerover", (event) => {
      if (!this.gesture) this.hovered(event.target);
    });
    this.element.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.full()) this.toggleFull();
    });
  }

  private pointOf(event: MouseEvent): { x: number; y: number } {
    const box = this.canvas.getBoundingClientRect();
    return this.camera.toWorld(event.clientX - box.left, event.clientY - box.top);
  }

  private onBackground(target: EventTarget | null): boolean {
    const element = target as Element | null;
    return element === this.canvas || element === this.world || element === this.nodes || element === this.wires || element?.classList?.contains("wb-blank") === true;
  }

  private pressed(event: PointerEvent): void {
    const target = event.target as Element;
    if (target.closest(".wb-menu, .wb-edit, .wb-promote, .wb-peek, .wb-peek-panel, .wb-next, [contenteditable]")) return;
    // On a phone, the page scrolls over a canvas in the page; the blueprint is worked on full screen.
    if (event.pointerType === "touch" && !this.full()) return;
    if (event.pointerType === "touch") {
      this.pinches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pinches.size === 2) {
        this.gesture = null;
        this.preview = null;
        return;
      }
    }
    if (event.button !== 0) return;
    this.closeMenu?.();
    const at = this.pointOf(event);
    const pin = target.closest<HTMLElement>(".wb-pin");
    const nodeElement = target.closest<HTMLElement>(".wb-node");
    const hit = target.closest<SVGElement>(".wb-wire-hit");
    this.chosenWire = null;
    if (pin && nodeElement?.dataset["node"]) {
      this.grabPin(event, { node: nodeElement.dataset["node"], pin: pin.dataset["pin"] ?? "", side: pin.dataset["side"] === "input" ? "input" : "output" }, at);
    } else if (nodeElement?.dataset["node"]) {
      const id = nodeElement.dataset["node"];
      if (event.shiftKey && this.selection.has(id)) this.selection.delete(id);
      else if (event.shiftKey) this.selection.add(id);
      else if (!this.selection.has(id)) this.selection = new Set([id]);
      this.gesture = { kind: "move", ids: [...this.selection], from: at, before: this.history.now, moved: false };
    } else if (hit?.dataset["to"]) {
      const [node = "", pinName = ""] = hit.dataset["to"].split("\u0000");
      this.chosenWire = this.history.now.wires.find((wire) => wire.to.node === node && wire.to.pin === pinName) ?? null;
      this.selection.clear();
      this.say("A wire chosen: Delete takes it away; or drag its end off the input it goes into.");
    } else if (event.shiftKey) {
      this.gesture = { kind: "marquee", from: at, at, base: new Set(this.selection) };
    } else {
      this.gesture = { kind: "pan", x: event.clientX, y: event.clientY, from: { x: this.camera.x, y: this.camera.y }, moved: false };
    }
    this.canvas.setPointerCapture?.(event.pointerId);
    this.canvas.focus({ preventScroll: true });
    this.render();
  }

  /** A wire taken by one end: out of an output, a new wire; off a wired input, the wire there, to be dropped elsewhere or let go. */
  private grabPin(event: PointerEvent, end: PinFound, at: { x: number; y: number }): void {
    const { kit } = this.setting;
    const now = this.history.now;
    const typeOf = (found: PinFound) => {
      const kind = kit.kinds.get(now.nodes.find((node) => node.id === found.node)?.kind ?? "");
      return (found.side === "output" ? kind?.outputs : kind?.inputs)?.find((pin) => pin.name === found.pin)?.type ?? "value";
    };
    if (event.altKey) {
      this.edit(withoutWires(now, { node: end.node, pin: end.pin }, end.side));
      return;
    }
    const existing = end.side === "input" ? now.wires.find((wire) => wire.to.node === end.node && wire.to.pin === end.pin) : undefined;
    if (existing) {
      const from: PinFound = { node: existing.from.node, pin: existing.from.pin, side: "output" };
      this.preview = withoutWires(now, existing.to, "input");
      this.gesture = { kind: "wire", end: from, type: typeOf(from), at, detached: existing, before: now };
    } else this.gesture = { kind: "wire", end, type: typeOf(end), at, detached: null, before: now };
    this.markFits(this.gesture.end);
  }

  /** Every pin the wire being dragged could go into, lit, and the rest dimmed, as Unreal does: what fits where, seen before it is tried. */
  private markFits(end: PinFound): void {
    const { kit } = this.setting;
    const blueprint = this.blueprint;
    this.canvas.classList.add("wiring");
    for (const [id, view] of this.views)
      for (const pin of view.element.querySelectorAll<HTMLElement>(".wb-pin")) {
        const name = pin.dataset["pin"] ?? "";
        const side = pin.dataset["side"];
        const wire = end.side === "output" && side === "input" ? { from: { node: end.node, pin: end.pin }, to: { node: id, pin: name } } : end.side === "input" && side === "output" ? { from: { node: id, pin: name }, to: { node: end.node, pin: end.pin } } : null;
        pin.classList.toggle("fits", wire !== null && wireRefused(blueprint, kit, wire) === null);
        pin.classList.toggle("held", id === end.node && name === end.pin);
      }
  }

  private clearFits(): void {
    this.canvas.classList.remove("wiring");
    for (const pin of this.canvas.querySelectorAll(".wb-pin.fits, .wb-pin.held")) pin.classList.remove("fits", "held");
  }

  private moved(event: PointerEvent): void {
    if (this.pinches.has(event.pointerId)) {
      const before = [...this.pinches.values()];
      this.pinches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const after = [...this.pinches.values()];
      if (before.length === 2 && after.length === 2) {
        const [a, b, c, d] = [before[0]!, before[1]!, after[0]!, after[1]!];
        const box = this.canvas.getBoundingClientRect();
        this.camera.zoomAt((c.x + d.x) / 2 - box.left, (c.y + d.y) / 2 - box.top, Math.hypot(c.x - d.x, c.y - d.y) / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)));
        this.camera.x += (c.x + d.x - a.x - b.x) / 2;
        this.camera.y += (c.y + d.y - a.y - b.y) / 2;
        this.applyCamera();
        return;
      }
    }
    const gesture = this.gesture;
    if (!gesture) return;
    const at = this.pointOf(event);
    if (gesture.kind === "pan") {
      gesture.moved ||= Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 3;
      this.camera.x = gesture.from.x + event.clientX - gesture.x;
      this.camera.y = gesture.from.y + event.clientY - gesture.y;
      this.applyCamera();
    } else if (gesture.kind === "move") {
      const [dx, dy] = [Math.round(at.x - gesture.from.x), Math.round(at.y - gesture.from.y)];
      gesture.moved ||= Math.abs(dx) + Math.abs(dy) > 2;
      if (gesture.moved) {
        this.preview = movedBy(gesture.before, gesture.ids, dx, dy);
        this.render();
      }
    } else if (gesture.kind === "wire") {
      gesture.at = at;
      const target = pinAt(this.blueprint, this.setting.kit, at);
      const wire = target && this.wireBetween(gesture.end, target);
      this.say(target && wire ? (wireRefused(this.blueprint, this.setting.kit, wire) ?? `Let go to wire it into ${target.pin}.`) : "Let go on a pin to wire it, or in empty space to choose what comes next.");
      this.drawWires();
    } else {
      gesture.at = at;
      const [left, top] = [Math.min(gesture.from.x, at.x), Math.min(gesture.from.y, at.y)];
      const [right, bottom] = [Math.max(gesture.from.x, at.x), Math.max(gesture.from.y, at.y)];
      const inside = this.history.now.nodes.filter((node) => node.x < right && node.x + NODE.width > left && node.y < bottom && node.y + nodeShapeOf(this.setting.kit.kinds.get(node.kind)).height > top).map((node) => node.id);
      this.selection = new Set([...gesture.base, ...inside]);
      Object.assign(this.marquee.style, { left: `${left * this.camera.zoom + this.camera.x}px`, top: `${top * this.camera.zoom + this.camera.y}px`, width: `${(right - left) * this.camera.zoom}px`, height: `${(bottom - top) * this.camera.zoom}px` });
      this.marquee.hidden = false;
      this.render();
    }
  }

  /** The wire two pins would make, the output's end first; none between two pins of one side. */
  private wireBetween(end: PinFound, other: PinFound): Wire | null {
    if (end.side === other.side) return null;
    const [output, input] = end.side === "output" ? [end, other] : [other, end];
    return { from: { node: output.node, pin: output.pin }, to: { node: input.node, pin: input.pin } };
  }

  private released(event: PointerEvent): void {
    this.pinches.delete(event.pointerId);
    const gesture = this.gesture;
    this.gesture = null;
    this.marquee.hidden = true;
    this.clearFits();
    if (!gesture) return;
    if (gesture.kind === "pan" && !gesture.moved) {
      this.selection.clear();
      this.render();
    } else if (gesture.kind === "move" && gesture.moved) {
      this.edit(movedBy(gesture.before, gesture.ids, Math.round(this.pointOf(event).x - gesture.from.x), Math.round(this.pointOf(event).y - gesture.from.y)));
    } else if (gesture.kind === "wire") {
      const at = this.pointOf(event);
      const target = pinAt(this.blueprint, this.setting.kit, at);
      const wire = target && this.wireBetween(gesture.end, target);
      if (wire) {
        const refused = wireRefused(this.blueprint, this.setting.kit, wire);
        if (refused) {
          this.preview = null;
          this.render();
          this.say(`Not wired: ${refused}.`);
        } else this.edit(withWire(this.blueprint, wire));
      } else if (target && target.node === gesture.end.node && target.pin === gesture.end.pin) {
        this.preview = null;
        this.render();
      } else this.openMenu(at, { type: gesture.type, side: gesture.end.side }, gesture.end, gesture.detached);
    } else this.render();
  }

  private keyed(event: KeyboardEvent): void {
    if ((event.target as Element).closest("input, select, textarea, [contenteditable]")) return;
    const command = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (event.key === "Delete" || event.key === "Backspace") this.remove();
    else if (command && key === "z") this.step(event.shiftKey ? "redo" : "undo");
    else if (command && key === "y") this.step("redo");
    else if (command && key === "d") this.duplicate();
    else if (command && key === "a") {
      this.selection = new Set(this.history.now.nodes.map((node) => node.id));
      this.render();
    } else if (!command && (event.key === " " || key === "a" || event.key === "Tab")) this.openMenu(null, undefined);
    else if (!command && key === "f") this.fit();
    else if (event.key === "Escape" && !this.full()) {
      this.selection.clear();
      this.chosenWire = null;
      this.render();
    } else return;
    event.preventDefault();
  }

  /** The line under the canvas says what is under the pointer: what flows out of a pin, or what a node does. */
  private hovered(target: EventTarget | null): void {
    const element = target as Element | null;
    const pin = element?.closest<HTMLElement>(".wb-pin");
    const node = element?.closest<HTMLElement>(".wb-node")?.dataset["node"];
    if (!node) return this.say();
    const placed = this.history.now.nodes.find((each) => each.id === node);
    const kind = placed && this.setting.kit.kinds.get(placed.kind);
    if (!kind) return this.say();
    if (!pin) return this.say(`${kind.title}: ${kind.summary}`);
    const name = pin.dataset["pin"] ?? "";
    const result = this.evaluation.get(node);
    const output = pin.dataset["side"] === "output";
    const declared = (output ? kind.outputs : kind.inputs).find((each) => each.name === name);
    const type = declared && this.setting.kit.types.get(declared.type);
    const value = result?.state === "done" ? (output ? result.outputs[name] : result.inputs[name]) : undefined;
    const flowing = value !== undefined && type ? `: ${type.describe(value)}` : "";
    this.say(`${declared?.label || name}, ${type?.label ?? "a value"}${flowing}. ${output ? "Drag it to an input, or into empty space for what comes next." : "Drag a wire into it, or out of it for what could feed it."}${declared && "hint" in declared && declared.hint ? ` ${declared.hint}.` : ""}`);
  }
}
