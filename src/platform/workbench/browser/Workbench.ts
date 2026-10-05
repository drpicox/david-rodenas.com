import { el } from "../../browser/el";
import type { Blueprint, PlacedNode, Wire } from "../../blueprint/Blueprint";
import { dialsOf } from "../../blueprint/dialsOf";
import { duplicated } from "../../blueprint/duplicated";
import type { Evaluation } from "../../blueprint/Evaluation";
import { evaluateBlueprint } from "../../blueprint/evaluateBlueprint";
import { freshId } from "../../blueprint/freshId";
import type { Kit } from "../../blueprint/kitOf";
import { movedBy } from "../../blueprint/movedBy";
import { NODE } from "../../blueprint/NODE";
import type { Literal } from "../../blueprint/NodeKind";
import { nodeShapeOf } from "../../blueprint/nodeShapeOf";
import { parseBlueprint } from "../../blueprint/parseBlueprint";
import { printBlueprint } from "../../blueprint/printBlueprint";
import { resolvedEditor } from "../../blueprint/resolvedEditor";
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
import { openKindMenu } from "./openKindMenu";
import { openTextPanel } from "./openTextPanel";

/** Where a workbench stands, and what it is handed. */
export interface WorkbenchSetting {
  readonly kit: Kit;
  readonly files: FilesInBrowser;
  /** The blueprint the page wrote: what Reset goes back to. */
  readonly example: string;
  /** A version to start from instead — the reader's own, kept, or one a link carried — and what to say about it. */
  readonly start?: { readonly text: string; readonly said: string };
  /** The board the build wrote, shown until the blueprint has run here: the pictures do not blink out while it does. */
  readonly stillBoard?: string;
  /** Told the blueprint's text after every edit, to keep it; told nothing when it is the page's own again. */
  keep(text: string | null): void;
  /** A link that opens this blueprint as it now is. */
  linkTo(text: string): string;
  copy(text: string): Promise<void>;
}

type Gesture =
  | { readonly kind: "pan"; readonly x: number; readonly y: number; readonly from: { x: number; y: number }; moved: boolean }
  | { readonly kind: "move"; readonly ids: readonly string[]; readonly from: { x: number; y: number }; readonly before: Blueprint; moved: boolean }
  | { readonly kind: "wire"; readonly end: PinFound; readonly type: string; at: { x: number; y: number }; readonly detached: Wire | null; readonly before: Blueprint }
  | { readonly kind: "marquee"; readonly from: { x: number; y: number }; at: { x: number; y: number }; readonly base: ReadonlySet<string> };

const SVG = "http://www.w3.org/2000/svg";
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
  private readonly history: EditHistory<Blueprint>;
  private readonly example: Blueprint;
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
  private readonly status: HTMLElement;
  private readonly board: BoardView;
  private readonly views = new Map<string, NodeView>();
  private readonly buttons: Record<"undo" | "redo" | "reset" | "full", HTMLButtonElement>;
  private closeMenu: (() => void) | null = null;
  private scheduled = false;
  private stopped = false;
  /** Run only once it is near the screen: a page of blueprints does not run all of them for a reader who reads the first. */
  private awake = false;
  private ran = false;
  private notice: string;
  private readonly stopListening: () => void;
  private pinches = new Map<number, { x: number; y: number }>();

  constructor(private readonly setting: WorkbenchSetting) {
    this.example = this.laidOut(setting.example);
    this.history = new EditHistory(setting.start ? this.laidOut(setting.start.text) : this.example);
    this.notice = setting.start?.said ?? "";

    this.wires = document.createElementNS(SVG, "svg");
    this.wires.classList.add("wb-wires");
    this.nodes = el("div", { class: "wb-nodes" });
    this.world = el("div", { class: "wb-world" }, this.wires, this.nodes);
    this.marquee = el("div", { class: "wb-marquee", hidden: true });
    this.canvas = el("div", { class: "wb-canvas", tabindex: 0, role: "application", "aria-label": "The blueprint's canvas: its nodes and wires" }, this.world, this.marquee, el("p", { class: "wb-blank" }, "An empty blueprint. Double-click here, or press the space bar, to add a node."));
    this.status = el("p", { class: "wb-status", "aria-live": "polite" });
    this.board = new BoardView({ turn: (node, value, done) => this.write(node, "value", value, done), find: (node) => this.find(node) });

    const button = (label: string, title: string, act: () => void, extra = "") => {
      const made = el("button", { type: "button", title, "aria-label": title, class: extra }, label);
      made.addEventListener("click", act);
      return made;
    };
    this.buttons = {
      undo: button("Undo", "Undo (Ctrl+Z)", () => this.step("undo")),
      redo: button("Redo", "Redo (Ctrl+Shift+Z)", () => this.step("redo")),
      reset: button("Reset", "Go back to the page's own blueprint", () => this.reset()),
      full: button("Full screen", "Work on it full screen (Esc to come back)", () => this.toggleFull(), "wb-full-button"),
    };
    const bar = el(
      "div",
      { class: "wb-bar", role: "toolbar", "aria-label": "Blueprint" },
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
    this.element = el("div", { class: "workbench" }, bar, el("div", { class: "wb-main" }, el("div", { class: "wb-stage" }, this.canvas, this.status), this.board.element));
    // The stylesheet draws a node at the sizes a wire is drawn to: it is told them, so the two cannot drift apart.
    for (const [name, size] of Object.entries(NODE)) this.element.style.setProperty(`--bp-${name}`, `${size}px`);

    this.listen();
    this.stopListening = setting.files.listen(() => this.schedule());
    if (setting.stillBoard) this.board.showStill(setting.stillBoard);
    this.render();
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
    this.setting.keep(now === this.example ? null : printBlueprint(now, this.setting.kit));
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
    this.history.push(this.example);
    this.notice = "Back to the page's own blueprint.";
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
        view = new NodeView(kit, node.id, { write: (id, pin, value, done) => this.write(id, pin, value, done), promote: (id, pin) => this.promote(id, pin), rename: (id, title) => this.edit(withTitle(this.history.now, id, title)) });
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
    if (this.ran || !this.setting.stillBoard) this.drawBoard();
    this.canvas.classList.toggle("blank", blueprint.nodes.length === 0);
    this.buttons.undo.disabled = !this.history.canUndo;
    this.buttons.redo.disabled = !this.history.canRedo;
    this.buttons.reset.disabled = this.history.now === this.example;
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
      paths.push(hit);
    }
    const gesture = this.gesture;
    if (gesture?.kind === "wire") {
      const fixed = pinPoint(gesture.end.node, gesture.end.pin, gesture.end.side === "output" ? "outputs" : "inputs");
      if (fixed) paths.push(this.path(gesture.end.side === "output" ? wirePath(fixed, gesture.at) : wirePath(gesture.at, fixed), "wb-wire dragging", kit.types.get(gesture.type)?.colour));
    }
    this.wires.replaceChildren(...paths);
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
    const dial: PlacedNode = { id: dialId, kind: "dial", x: node.x - NODE.width - 60, y: node.y + row - NODE.header - NODE.row * 1.5, title: input.label || pin, values: { value } };
    this.edit(withWire(withValue(withNode(now, dial), id, pin, undefined), { from: { node: dialId, pin: "value" }, to: { node: id, pin } }));
    this.say(`${input.label || pin} is on the board now, as a dial.`);
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
    const world = at ?? this.camera.toWorld(box.width / 2 - NODE.width / 2, box.height / 3);
    const screen = { left: world.x * this.camera.zoom + this.camera.x, top: world.y * this.camera.zoom + this.camera.y };
    let taken = false;
    this.say(dragged ? "Choose what comes next, typing to narrow it; Escape lets the wire go." : "Choose a node, typing to narrow it; Escape closes the menu.");
    this.closeMenu = openKindMenu(
      this.canvas,
      this.setting.kit,
      { left: Math.max(4, Math.min(screen.left, box.width - 280)), top: Math.max(4, Math.min(screen.top, box.height - 364)) },
      dragged,
      (offer) => {
        taken = true;
        this.add(offer, world, end);
      },
      () => {
        this.closeMenu = null;
        // A wire pulled off its input and dropped where nothing was chosen is let go: that is how a wire is taken away by hand.
        if (!taken && detached) this.edit(withoutWires(this.history.now, detached.to, "input"));
        else if (!taken) this.preview = null;
        this.render();
        this.canvas.focus({ preventScroll: true });
      },
    );
  }

  private add(offer: Offer, at: { x: number; y: number }, end?: PinFound): void {
    const now = this.history.now;
    const id = freshId(now, offer.kind.name);
    const node: PlacedNode = { id, kind: offer.kind.name, x: Math.round(end?.side === "input" ? at.x - NODE.width : at.x), y: Math.round(at.y - NODE.header / 2), values: {} };
    let next = withNode(now, node);
    if (end && offer.pin) next = withWire(next, end.side === "output" ? { from: { node: end.node, pin: end.pin }, to: { node: id, pin: offer.pin } } : { from: { node: id, pin: offer.pin }, to: { node: end.node, pin: end.pin } });
    this.selection = new Set([id]);
    this.edit(next);
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
    const link = this.setting.linkTo(printBlueprint(this.history.now, this.setting.kit));
    try {
      await this.setting.copy(link);
      this.say("A link to this blueprint, as it is now, is copied: whoever opens it sees it so.");
    } catch {
      this.say(link);
    }
  }

  /** What the hands do, said where the hands are: on a page full screen, the page's own words are out of sight. */
  private toggleHelp(): void {
    const open = this.element.querySelector(".wb-help");
    if (open) {
      open.remove();
      return;
    }
    const line = (keys: string, what: string) => el("li", {}, el("strong", {}, keys), ` ${what}`);
    const close = el("button", { type: "button", class: "wb-help-close", "aria-label": "Close" }, "✕");
    const help = el(
      "div",
      { class: "wb-help", role: "dialog", "aria-label": "How to use it" },
      close,
      el(
        "ul",
        {},
        line("Drag from a pin", "to wire it: let go on another pin, or in empty space to choose what comes next."),
        line("Double-click, or the space bar,", "to add any node."),
        line("Drag a node by its title", "to move it, and the canvas to move about; Ctrl and the wheel zoom; F fits it all."),
        line("Shift and drag", "chooses several; Delete takes them away, Ctrl+D copies them, Ctrl+Z undoes."),
        line("Alt and a click on a pin", "lets go of its wires; so does dragging a wire off its input into empty space."),
        line("◉ beside a value", "puts it on the board as a dial; ▶ on a dial plays it."),
        line("Double-click a title", "to rename the node; a picture's title on the board finds its node."),
      ),
    );
    close.addEventListener("click", () => help.remove());
    this.element.append(help);
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
    if (target.closest(".wb-menu, .wb-edit, .wb-promote, [contenteditable]")) return;
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
