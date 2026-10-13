import type { Example } from "../../../platform/blueprint/examplesOf";
import { withoutNodes } from "../../../platform/blueprint/withoutNodes";
import { withoutWires } from "../../../platform/blueprint/withoutWires";
import { withTitle } from "../../../platform/blueprint/withTitle";
import { withWire } from "../../../platform/blueprint/withWire";
import { el } from "../../../platform/browser/el";
import type { Bench, BenchSetting } from "../../../platform/plugin/Bench";
import { BoardView } from "../../../platform/workbench/browser/BoardView";
import { morphInto } from "../../../platform/workbench/browser/morphInto";
import { openExamples } from "../../../platform/workbench/browser/openExamples";
import { openKindMenu } from "../../../platform/workbench/browser/openKindMenu";
import { openTextPanel } from "../../../platform/workbench/browser/openTextPanel";
import { OpenBlueprint } from "../../../platform/workbench/OpenBlueprint";
import { joinsOf } from "../joinsOf";
import { questionOf } from "../questionOf";
import { rowAt } from "../rowAt";
import { SCHEMATIC } from "../SCHEMATIC";
import { schematicMarkup } from "../schematicMarkup";
import { withRow } from "../withRow";
import { openChoice } from "./openChoice";
import { QueryView } from "./QueryView";

const HINT = "Press a module to ask what it takes and gives. Drag the port at its end onto another module to feed it, or the module itself to another row.";
const PRESS = "Press the module it should feed: those that can take it are lit. Escape lets it go.";
const MOVED = "Moved: everything else stays where it stood. Tidy hands the layout back to the display.";
/** How wide the menu of kinds is with its words beside its list. */
const MENU_SIDE = 580;
/** How far a hand moves before what it pressed is being dragged: nearer, it was a press. */
const SLACK = 4;
/** How near an end of the schematic a hand running a conduit moves it along, and by how much each time it moves there. */
const EDGE = 28;
const CREEP = 14;
const two = (count: number) => String(count).padStart(2, "0");
/** No module put anywhere by hand: the layout is all the display's. */
const NOWHERE: ReadonlyMap<string, number> = new Map();

/** A wire of the blueprint open, and one end of one, called so without this display having to know the blueprint's own files. */
type Wired = OpenBlueprint["now"]["wires"][number];
type End = { readonly node: string; readonly pin?: string };

/** A conduit being run by hand. */
interface Running {
  /** The module it leaves, the output of it where that is said, and the port the hand took. */
  readonly from: End & { readonly port: string };
  /** The conduit lifted off the input it fed: it goes where this one goes, or away. */
  readonly lifted: Wired | null;
  /** Held by a hand that drags it. If not, it was asked for at a pad, and the module pressed next ends it. */
  readonly held: boolean;
  /** Where the hand is, in the schematic's own pixels, and what it is over there. */
  at?: { readonly x: number; readonly y: number };
  over?: End | null;
}

/**
 * A blueprint as a starship's display would show it, and work it. The same
 * program, the same nodes and the same data as the workbench; another idea
 * of what hands do. The display lays the modules out itself, on a grid, and
 * a blueprint is worked on by pressing — a module, to ask what it takes and
 * gives; a pad, to add what could come next, to take it away again, to go
 * back. Every figure on a pad is a real one, and what flows is seen to: a
 * stream along every conduit, and a pulse out of whatever ran again, which
 * is only what follows the dial that was turned.
 *
 * A conduit is run by hand: the port at a module's end is dragged onto the
 * module it should feed, and the display works out which input takes it —
 * asking, where several could. Lifted off the input it feeds, it is let go
 * on another module, or nowhere, which takes it out. Pad by pad it is the
 * same: Feed beside an output, then the module pressed.
 *
 * A module is moved by hand too, as far as the grid lets it: up and down
 * its column, onto another row, where it changes places with what stood
 * there. Its column is the flow's to say. From then on everything stays
 * where it stood, and the display only finds a place for what is new, until
 * Tidy hands the layout back.
 *
 * A trial, and a small one on purpose. Where modules were put is kept for
 * undoing, but not with the reader's version, nor in a link: the text of a
 * blueprint says nothing of it. That text is a pad away, for whatever the
 * pads do not reach, and the workbench a flag away.
 */
export class LcarsConsole implements Bench {
  readonly element: HTMLElement;
  /** The blueprint open here: its history, its runs, the reader's own version of it. This display only draws it, and hands it what pads do. */
  private readonly work: OpenBlueprint;
  private chosen: string | null = null;
  private pointed: string | null = null;
  private closeMenu: (() => void) | null = null;
  /** The conduit a hand is running, while one is. */
  private running: Running | null = null;
  /** How a hand that pressed a port is no longer listened to. */
  private letGo: (() => void) | null = null;
  /** A drag ended a moment ago: the press a browser sends where it ends is not one. */
  private swallow = false;
  /** The rows a hand put the modules on, for every state of the blueprint it has been drawn in: so that undoing goes back to where they stood, too. */
  private readonly stood = new WeakMap<object, ReadonlyMap<string, number>>();
  /** Where they stood in the state drawn last: a state not drawn yet starts from it. */
  private last = NOWHERE;
  /** The module a hand is moving: how far down the schematic the hand has it, the rows letting go would leave, and whether that is anything new. */
  private moving: { readonly node: string; readonly top: number; readonly rows: ReadonlyMap<string, number>; readonly changed: boolean } | null = null;
  /** Whether what flows is to be seen flowing, which its pad says, and whether the display is where it can be seen at all. */
  private flowing = true;
  private onScreen = true;
  private readonly watched: IntersectionObserver | undefined;
  private readonly title = el("p", { class: "lc-title" });
  private readonly count = el("span", { class: "lc-count" });
  private readonly about = el("p", { class: "lc-about" });
  private readonly lights = el("span", { class: "lc-lights", "aria-hidden": "true" });
  private readonly schematic = el("div", { class: "lc-schematic", tabindex: 0, role: "group", "aria-label": "The schematic: the blueprint's modules and conduits" });
  private readonly counted = el("span", { class: "lc-deck-said" });
  /** The block the pads end in, which carries how many modules and conduits there are. */
  private readonly fill = el("span", { class: "lc-fill", "aria-hidden": "true" });
  private readonly body: HTMLElement;
  private readonly status = el("p", { class: "lc-status", "aria-live": "polite" });
  private readonly query: QueryView;
  private readonly board: BoardView;
  private readonly keys: Record<"examples" | "undo" | "redo" | "reset" | "tidy" | "flow" | "full", HTMLButtonElement>;

  constructor(private readonly setting: BenchSetting) {
    // Kept without where the nodes stand: this display never placed them, and the workbench tidies what does not say.
    this.work = new OpenBlueprint(setting, () => this.render(), { positions: false });

    this.query = new QueryView(setting.kit, {
      write: (node, pin, value, done) => this.work.write(node, pin, value, done),
      promote: (node, pin) => this.promote(node, pin),
      go: (node) => this.choose(node),
      follow: (node, label) => this.follow(node, label),
      remove: (node) => this.remove(node),
      feed: (node, pin) => this.feed(node, pin),
      cut: (node, pin) => this.cut(node, pin),
    });
    this.board = new BoardView({
      turn: (node, value, done) => this.work.write(node, "value", value, done),
      find: (node) => this.choose(node),
      point: (node) => this.point(node),
      rename: (node, title) => this.work.edit(withTitle(this.work.now, node, title)),
    });

    const key = (name: string, label: string, title: string, act: () => void) => {
      const made = el("button", { type: "button", class: `lc-key lc-key-${name}`, title, "aria-label": title }, el("span", { class: "lc-key-code", "aria-hidden": "true" }), label);
      made.addEventListener("click", act);
      return made;
    };
    this.keys = {
      examples: key("examples", "Examples", "Open another of the page's blueprints here", () => this.toggleExamples()),
      undo: key("undo", "Undo", "Undo (Ctrl+Z)", () => this.work.undo()),
      redo: key("redo", "Redo", "Redo (Ctrl+Shift+Z)", () => this.work.redo()),
      reset: key("reset", "Reset", "Go back to the blueprint as the page wrote it", () => this.work.reset()),
      tidy: key("tidy", "Tidy", "Hand the layout back to the display: every module where it would stand of itself", () => this.arrange(NOWHERE, "Tidied: the layout is the display's again.")),
      flow: key("flow", "Flow", "What flows along the conduits, seen flowing: pressed, it rests", () => this.toggleFlow()),
      full: key("full", "Full display", "Give the display the whole window (Esc to come back)", () => this.toggleFull()),
    };
    const several = setting.examples.length > 1;
    const flip = (name: string, label: string, title: string, by: number) => {
      const made = el("button", { type: "button", class: `lc-flip lc-flip-${name}`, title, "aria-label": title }, label);
      made.addEventListener("click", () => this.flip(by));
      return made;
    };
    const rail = (...parts: string[]) => el("span", { class: "lc-rail", "aria-hidden": "true" }, ...parts.map((part) => el("i", { class: part })));
    const side = el(
      "div",
      { class: "lc-side", role: "toolbar", "aria-label": "Blueprint" },
      ...(several ? [this.keys.examples] : []),
      key("add", "Add", "Add a module: a source, a step, a picture, a note", () => this.add()),
      this.keys.undo,
      this.keys.redo,
      this.keys.reset,
      this.keys.tidy,
      key("text", "Text", "The blueprint as text, to read, copy or write", () => this.openText()),
      key("link", "Link", "Copy a link to the blueprint as it is now", () => void this.share()),
      key("help", "Help", "How this display is worked", () => this.toggleHelp()),
      this.keys.flow,
      this.keys.full,
      this.fill,
    );
    this.body = el(
      "div",
      { class: "lc-body" },
      el("section", { class: "lc-deck lc-flow", "aria-label": "The blueprint, as a schematic" }, el("p", { class: "lc-deck-head" }, el("span", { class: "lc-deck-name" }, "Schematic"), this.counted), this.schematic),
      this.query.element,
      el("section", { class: "lc-deck lc-readings", "aria-label": "The board: dials and pictures" }, el("p", { class: "lc-deck-head" }, el("span", { class: "lc-deck-name" }, "Board")), this.board.element),
      this.status,
    );
    this.element = el(
      "div",
      { class: "lcars" },
      el(
        "div",
        { class: "lc-top" },
        el("div", { class: "lc-top-side", "aria-hidden": "true" }, el("span", {}, "LCARS")),
        el("div", { class: "lc-top-body" }, el("div", { class: "lc-headline" }, this.title, el("p", { class: "lc-sub" }, ...(several ? [flip("back", "◀", "The blueprint before this one", -1)] : []), this.count, ...(several ? [flip("on", "▶", "The next blueprint", 1)] : []))), this.about),
        el("span", { class: "lc-elbow", "aria-hidden": "true" }),
        el("div", { class: "lc-bar" }, rail("a wide", "b", "c thin"), this.lights, rail("d", "a")),
      ),
      el("div", { class: "lc-main" }, el("span", { class: "lc-elbow", "aria-hidden": "true" }), el("div", { class: "lc-bar" }, rail("c wide", "a", "d thin", "b", "c")), side, this.body),
    );

    // The stylesheet draws a module at the sizes a conduit is run to: it is told them, so the two cannot drift apart.
    for (const [name, size] of Object.entries(SCHEMATIC)) this.element.style.setProperty(`--lc-${name}`, `${size}px`);

    // Whatever moves on a page moves only where it is seen: off the screen, the flow rests where it was.
    this.watched =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) this.onScreen = entry.isIntersecting;
            this.showFlow();
          })
        : undefined;
    this.watched?.observe(this.element);
    this.showFlow();

    this.listen();
    if (this.work.still) this.board.showStill(this.work.still);
    this.tellAbout();
    this.render();
  }

  /** One of the page's examples, open here: as the reader left it, if they did, and Reset going back to it. */
  open(example: Example): void {
    if (example === this.work.example) return;
    this.closeMenu?.();
    this.element.querySelector(".wb-examples")?.remove();
    this.chosen = null;
    // Where the modules of one blueprint were put is nothing to another.
    this.last = NOWHERE;
    this.work.open(example);
    this.tellAbout();
  }

  /** A blueprint written by someone else — an agent — shown as an edit, so that Undo and Reset still work. */
  ask(text: string): void {
    this.work.ask(text);
    this.say();
  }

  wake(): void {
    this.work.wake();
  }

  /** The display lays itself out: there is nothing to measure once it is on the page. */
  placed(): void {}

  stop(): void {
    this.work.stop();
    this.watched?.disconnect();
    this.letGo?.();
    this.closeMenu?.();
    document.body.classList.remove("lc-full-open");
  }

  // ---- drawing

  /** What the example open is called, what it is about, and which of the page's it is. */
  private tellAbout(): void {
    const { title, about } = this.work.example;
    const { examples } = this.setting;
    const at = examples.indexOf(this.work.example);
    this.title.textContent = title || "Blueprint";
    this.about.textContent = about;
    this.about.hidden = !about;
    this.count.textContent = examples.length > 1 && at >= 0 ? `Blueprint ${at + 1} of ${examples.length}` : "Blueprint";
    const code = this.keys.examples.querySelector(".lc-key-code");
    if (code) code.textContent = at >= 0 ? `${two(at + 1)}-${two(examples.length)}` : "";
  }

  private render(): void {
    const { work } = this;
    // A module taken away, by Undo or by an agent's blueprint, is no longer the one chosen.
    if (this.chosen !== null && !work.now.nodes.some((node) => node.id === this.chosen)) this.chosen = null;
    this.drawSchematic();
    this.showQuery();
    if (work.ran || !work.still) this.board.show(work.dials(), work.cards());
    this.keys.undo.disabled = !work.canUndo;
    this.keys.redo.disabled = !work.canRedo;
    this.keys.reset.disabled = !work.own;
    this.keys.tidy.disabled = this.put().size === 0;
    this.say();
  }

  /** The schematic, drawn again in place: a module that is still there is the same element, so a pulse along it is not cut short. */
  private drawSchematic(): void {
    const { now: blueprint, evaluation, runs } = this.work;
    // A dial says what it is set to as the board does: a station by its name, not its code.
    const set = new Map(this.work.dials().map((dial) => [dial.node, dial.said]));
    const joining = this.joining();
    const { moving } = this;
    morphInto(
      this.schematic,
      schematicMarkup({ blueprint, kit: this.setting.kit, evaluation, chosen: this.chosen, pointed: this.pointed, runs, set, read: this.setting.files.read, put: moving?.rows ?? this.put(), ...(joining && { joining }), ...(moving && { moving }) }),
    );
    this.schematic.classList.toggle("blank", blueprint.nodes.length === 0);
    this.counted.textContent = `${blueprint.nodes.length} ${blueprint.nodes.length === 1 ? "module" : "modules"} · ${blueprint.wires.length} ${blueprint.wires.length === 1 ? "conduit" : "conduits"}`;
    this.fill.textContent = `${two(blueprint.nodes.length)}-${two(blueprint.wires.length)}`;
    // A light for each module, lit as it answers: the whole blueprint's state, at a glance.
    this.lights.replaceChildren(...blueprint.nodes.map((node) => el("i", { class: evaluation.get(node.id)?.state ?? "idle" })));
  }

  /** The module chosen, asked: how each input of it is written, or where it comes from, and what could come after it. */
  private showQuery(): void {
    const { kit } = this.setting;
    const blueprint = this.work.now;
    const node = blueprint.nodes.find((each) => each.id === this.chosen);
    if (!node) return this.query.show(null);
    const dial = this.work.dials().find((each) => each.node === node.id);
    const from = new Map(
      blueprint.wires.flatMap((wire) => {
        const source = blueprint.nodes.find((each) => each.id === wire.from.node);
        const sourceKind = source && kit.kinds.get(source.kind);
        if (wire.to.node !== node.id || !source) return [];
        const output = sourceKind?.outputs.find((pin) => pin.name === wire.from.pin);
        const named = source.title ?? sourceKind?.title ?? source.kind;
        return [[wire.to.pin, { node: source.id, said: (sourceKind?.outputs.length ?? 0) > 1 && output ? `${named} · ${output.label}` : named }] as const];
      }),
    );
    this.query.show({
      node,
      result: this.work.evaluation.get(node.id),
      from,
      // A dial is turned the way the input it is wired into is written.
      editors: dial ? new Map([["value", dial.editor]]) : this.work.editorsOf(node),
      next: this.work.nextFor(node.id),
      ...(dial && { said: `on the board: ${dial.said}` }),
      ...(this.running && !this.running.held && this.running.from.node === node.id && { feeding: this.running.from.port }),
    });
  }

  /** The line under the display: what was just done, what a conduit asked for at a pad waits for, or how to begin. */
  private say(words?: string): void {
    this.status.textContent = words ?? (this.running && !this.running.held ? PRESS : this.work.notice || HINT);
  }

  /** Something said of what was just done, kept as what the line says until the next edit: a run that ends a moment later would otherwise wipe it. */
  private note(words: string): void {
    this.work.notice = words;
    this.say();
  }

  // ---- what pressing does to the blueprint

  private choose(id: string | null): void {
    this.chosen = id;
    this.render();
    if (id !== null) [...this.schematic.querySelectorAll<HTMLElement>("[data-node]")].find((module) => module.dataset["node"] === id)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }

  /** The module a dial or a picture of the board comes from, lit on the schematic while it is pointed at. */
  private point(id: string | null): void {
    if (id === this.pointed) return;
    this.pointed = id;
    this.drawSchematic();
  }

  /** A next step taken: its module added, wired from the one it follows, written as offered, and chosen — so what could come after it is offered in turn. */
  private follow(id: string, label: string): void {
    const offer = this.work.nextFor(id).find((each) => each.label === label);
    if (!offer) return;
    // Where it stands is the schematic's to say.
    this.choose(this.work.follow(id, offer, { x: 0, y: 0 }));
    this.note(`${offer.label}: added, wired from what was chosen. What could come after it is offered in turn.`);
  }

  /** An input put on the board: a dial wired into it, holding what the input holds now. */
  private promote(id: string, pin: string): void {
    if (this.work.promote(id, pin, { x: 0, y: 0 }) !== null) this.note("On the board now, as a dial: turn it there.");
  }

  private remove(id: string): void {
    this.work.edit(withoutNodes(this.work.now, [id]));
    this.note("Taken out, with its conduits. Undo brings it back.");
  }

  /** The menu of kinds, those on trial among them only while their flag is on — and, for a conduit let go where nothing stands, only those it could feed. The one chosen is added, fed by the conduit if there is one, and chosen: where it stands is the schematic's to say. */
  private offer(fed?: { readonly node: string; readonly pin: string; readonly type: string }): void {
    const { kit } = this.setting;
    const box = this.body.getBoundingClientRect();
    this.say(fed ? "Choose what it feeds, typing to narrow it; Escape lets the conduit go." : "Choose what to add, typing to narrow it; Escape closes the menu. What it needs is run to it once it is there.");
    this.closeMenu = openKindMenu(
      this.body,
      { kinds: new Map([...kit.kinds].filter(([, kind]) => this.work.offers(kind))), types: kit.types },
      { left: 8, top: 8, ...(box.height > 0 && { height: Math.max(200, Math.min(420, box.height - 16)) }), side: box.width >= MENU_SIDE + 16 },
      fed && { type: fed.type, side: "output" },
      ({ kind, pin }) => this.choose(this.work.add(kind.name, { x: 0, y: 0 }, fed && pin !== undefined ? { pin, from: { node: fed.node, pin: fed.pin } } : undefined)),
      () => {
        this.closeMenu = null;
        this.say();
      },
    );
  }

  private add(): void {
    if (this.closeMenu) return this.closeMenu();
    this.offer();
  }

  // ---- a module moved by hand

  /** The rows a hand put the modules on, as the blueprint now is: what was said of this state of it, or — for one not drawn before — where they stood in the last, unless it is the page's own again. */
  private put(): ReadonlyMap<string, number> {
    const now = this.work.now;
    const known = this.stood.get(now) ?? (now === this.work.original ? NOWHERE : this.last);
    this.stood.set(now, known);
    this.last = known;
    return known;
  }

  /** Where the modules stand and where the rows are, read off the schematic as it is drawn: a hand on it is on what it shows, and nothing else. */
  private laid() {
    const modules = [...this.schematic.querySelectorAll<HTMLElement>("[data-node]")].map((module) => ({
      id: module.dataset["node"] ?? "",
      column: Number(module.dataset["column"]),
      row: Number(module.dataset["row"]),
      y: Number.parseFloat(module.style.top) || 0,
    }));
    const said = this.schematic.querySelector<HTMLElement>(".lc-world")?.dataset["rows"] ?? "";
    const rows = said.split(" ").filter(Boolean).map((row) => ({ top: Number(row.split(":")[0]), height: Number(row.split(":")[1]) }));
    return { modules, rows };
  }

  /** The modules put on other rows, as a step of its own: the blueprint is what it was, and Undo goes back to where they stood. */
  private arrange(rows: ReadonlyMap<string, number>, words: string): void {
    const next = { ...this.work.now };
    this.stood.set(next, rows);
    this.work.edit(next);
    this.note(words);
  }

  /** A hand comes down on a module, away from its ports: carried up or down, it is put on another row. Its column is the flow's to say, so it does not leave it. */
  private carry(event: PointerEvent, node: string): void {
    const start = event.clientY;
    const base = this.laid();
    const from = base.modules.find((module) => module.id === node);
    if (!from) return;
    this.track(
      (move) => {
        if (!this.moving && Math.abs(move.clientY - start) < SLACK) return;
        if (!this.moving) this.closeMenu?.();
        const top = from.y + move.clientY - start;
        // Where the middle of its pad is says which row it is on: the rows as they were when it was taken, so that the answer does not shift as the rest makes room.
        const row = rowAt(base.rows, top + SCHEMATIC.pad / 2);
        this.moving = { node, top, rows: row === from.row ? this.put() : withRow(base.modules, node, row), changed: row !== from.row };
        this.drawSchematic();
        this.say("Let go to stand it on this row. A module keeps its column: the flow says which.");
      },
      (end) => {
        const { moving } = this;
        if (!moving) return false;
        this.moving = null;
        if (end.type === "pointercancel" || !moving.changed) this.render();
        else this.arrange(moving.rows, MOVED);
        return true;
      },
    );
  }

  /** The module chosen, put a row down or up. */
  private nudge(by: number): void {
    const laid = this.laid();
    const at = laid.modules.find((module) => module.id === this.chosen);
    if (at) this.arrange(withRow(laid.modules, at.id, at.row + by), MOVED);
  }

  /** A hand that pressed is followed over the whole page until it lets go, or is called away. What ends it says whether anything was dragged: the press a browser then sends where the drag ended is not one. */
  private track(moved: (move: PointerEvent) => void, ended: (end: PointerEvent) => boolean): void {
    const page = this.element.ownerDocument;
    const over = (end: PointerEvent) => {
      this.letGo?.();
      if (!ended(end)) return;
      this.swallow = true;
      setTimeout(() => (this.swallow = false), 0);
    };
    page.addEventListener("pointermove", moved);
    page.addEventListener("pointerup", over);
    page.addEventListener("pointercancel", over);
    this.letGo = () => {
      page.removeEventListener("pointermove", moved);
      page.removeEventListener("pointerup", over);
      page.removeEventListener("pointercancel", over);
      this.letGo = null;
    };
  }

  // ---- a conduit run by hand

  private kindOf(id: string) {
    return this.setting.kit.kinds.get(this.work.now.nodes.find((node) => node.id === id)?.kind ?? "");
  }

  private titleOf(id: string): string {
    return this.work.now.nodes.find((node) => node.id === id)?.title ?? this.kindOf(id)?.title ?? id;
  }

  /** The blueprint a conduit being run is run in: the one open, without the conduit lifted to run it. */
  private under(running: Running) {
    return running.lifted ? withoutWires(this.work.now, running.lifted.to, "input") : this.work.now;
  }

  /** What the schematic is told of the conduit being run: where from, where the hand is, and every input that could take it. */
  private joining() {
    const { running } = this;
    if (!running) return null;
    const base = this.under(running);
    const into = new Map(
      base.nodes.flatMap((node) => {
        const pins = [...new Set(joinsOf(base, this.setting.kit, running.from, { node: node.id }).wires.map((wire) => wire.to.pin))];
        return pins.length > 0 ? [[node.id, pins] as const] : [];
      }),
    );
    return { from: { node: running.from.node, port: running.from.port }, into, ...(running.at && { at: running.at }), ...(running.over && { over: running.over }), ...(running.lifted && { lifted: running.lifted.to }) };
  }

  /** The module something of the schematic is part of, and the input of it, where it is one: a port, or a line written under the module. */
  private endAt(found: EventTarget | null): End | null {
    if (!(found instanceof Element) || !this.schematic.contains(found)) return null;
    const node = found.closest<HTMLElement>("[data-node]")?.dataset["node"];
    const pin = found.closest<HTMLElement>(".lc-ins .lc-tab, .lc-row")?.dataset["pin"];
    return node === undefined ? null : { node, ...(pin !== undefined && { pin }) };
  }

  /** A hand comes down on the schematic: on a port out of a module, it may be about to run a conduit from it; on one into it, to lift the conduit there; anywhere else on a module, to carry it to another row. Nothing is begun until it has moved. */
  private pressed(event: PointerEvent): void {
    this.swallow = false;
    if (event.button !== 0 || this.running) return;
    const tab = (event.target as Element).closest<HTMLElement>(".lc-tab");
    const node = (event.target as Element).closest<HTMLElement>("[data-node]")?.dataset["node"];
    const pin = tab?.dataset["pin"];
    if (node === undefined) return;
    // A finger on a module moves the page under it, as it does anywhere else: only its ports are held.
    if (!tab || pin === undefined) return event.pointerType === "touch" ? undefined : this.carry(event, node);
    const into = tab.closest(".lc-ins") !== null;
    const lifted = into ? this.work.now.wires.find((wire) => wire.to.node === node && wire.to.pin === pin) : undefined;
    if (into && !lifted) return;
    // A port that carries the module's figure stands for all the module gives: which of it, where it gives several, is asked when the conduit is let go.
    const all = tab.classList.contains("lc-figure") && (this.kindOf(node)?.outputs.length ?? 0) > 1;
    const from = lifted ? { node: lifted.from.node, pin: lifted.from.pin, port: lifted.from.pin } : { node, port: pin, ...(!all && { pin }) };
    // A finger is held to what it first touched, unless it is let go of: what it is over has to be seen.
    try {
      tab.releasePointerCapture?.(event.pointerId);
    } catch {
      // It was not held.
    }
    const start = { x: event.clientX, y: event.clientY };
    this.track(
      (move) => {
        if (!this.running) {
          if (Math.hypot(move.clientX - start.x, move.clientY - start.y) < SLACK) return;
          this.closeMenu?.();
          this.running = { from, lifted: lifted ?? null, held: true };
        }
        this.runTo(move);
      },
      (end) => {
        if (!this.running?.held) return false;
        if (end.type === "pointercancel") this.endRun();
        else {
          this.runTo(end);
          this.drop(this.running.over ?? null, { x: end.clientX, y: end.clientY });
        }
        return true;
      },
    );
  }

  /** The conduit follows the hand: drawn out to it, what it is over lit, and what letting go there would do said. Near an end of the schematic, the schematic is moved along. */
  private runTo(event: PointerEvent): void {
    const { running } = this;
    if (!running) return;
    const page = this.element.ownerDocument;
    const box = this.schematic.getBoundingClientRect();
    if (box.width > 0 && event.clientX > box.right - EDGE) this.schematic.scrollLeft += CREEP;
    else if (box.width > 0 && event.clientX < box.left + EDGE) this.schematic.scrollLeft -= CREEP;
    const world = this.schematic.querySelector(".lc-world")?.getBoundingClientRect();
    running.at = { x: Math.round(event.clientX - (world?.left ?? 0)), y: Math.round(event.clientY - (world?.top ?? 0)) };
    // What the hand is over is asked of the page: the event may still be held to the port it began on.
    running.over = this.endAt(page.elementFromPoint?.(event.clientX, event.clientY) ?? event.target);
    this.drawSchematic();
    const { over } = running;
    if (!over) return this.say(running.lifted ? "Let go on a module to feed it instead, or where nothing stands to take the conduit out." : "Let go on a module that is lit to feed it, or where nothing stands for what could come next.");
    const joins = joinsOf(this.under(running), this.setting.kit, running.from, over);
    const title = this.titleOf(over.node);
    this.say(joins.plain ? `Let go to feed ${this.inputSaid(joins.plain)} of ${title}.` : joins.wires.length > 0 ? `Let go, and say which input of ${title} it feeds.` : `Not there: ${joins.refused}.`);
  }

  private inputSaid(wire: Wired): string {
    const pin = this.kindOf(wire.to.node)?.inputs.find((each) => each.name === wire.to.pin);
    return pin?.label || wire.to.pin;
  }

  /** A module's name, and which of what it gives where it gives several. */
  private outputSaid(wire: Wired): string {
    const outputs = this.kindOf(wire.from.node)?.outputs ?? [];
    const pin = outputs.find((each) => each.name === wire.from.pin);
    return outputs.length > 1 ? `${this.titleOf(wire.from.node)} (${pin?.label || wire.from.pin})` : this.titleOf(wire.from.node);
  }

  /** The conduit is let go: on a module, it feeds it, the display asking which input where several could take it; where nothing stands, one lifted is taken out, and one dragged out of a port asks what it should feed. */
  private drop(target: End | null, where: { readonly x: number; readonly y: number }): void {
    const { running } = this;
    if (!running) return;
    const base = this.under(running);
    this.running = null;
    if (!target && running.lifted) {
      this.work.edit(base);
      return this.note("Conduit taken out. Undo brings it back.");
    }
    if (!target) {
      this.render();
      const out = this.kindOf(running.from.node)?.outputs.find((pin) => pin.name === running.from.port);
      if (running.held && out) this.offer({ node: running.from.node, pin: out.name, type: out.type });
      return;
    }
    const joins = joinsOf(base, this.setting.kit, running.from, target);
    if (joins.plain) return this.join(base, joins.plain, running.lifted);
    this.render();
    if (joins.wires.length === 0) return this.note(`Not wired: ${joins.refused}.`);
    this.askWhich(base, joins.wires, running.lifted, where);
  }

  /** A conduit run: the module it feeds is chosen, so that what it takes and gives now is said. One lifted and put back where it was changes nothing. */
  private join(base: OpenBlueprint["now"], wire: Wired, lifted: Wired | null): void {
    const back = lifted !== null && lifted.from.node === wire.from.node && lifted.from.pin === wire.from.pin && lifted.to.node === wire.to.node && lifted.to.pin === wire.to.pin;
    if (back) return this.render();
    this.work.edit(withWire(base, wire));
    this.choose(wire.to.node);
    this.note(`${this.outputSaid(wire)} now feeds ${this.inputSaid(wire)} of ${this.titleOf(wire.to.node)}.`);
  }

  /** The display asks which of the conduits that could be run is meant, where the hand let go: a pad for each, saying what it would take the place of. */
  private askWhich(base: OpenBlueprint["now"], wires: readonly Wired[], lifted: Wired | null, where: { readonly x: number; readonly y: number }): void {
    const { asked, choices } = questionOf(base, this.setting.kit, wires);
    const box = this.body.getBoundingClientRect();
    this.say("Say which, at the pads; Escape lets the conduit go.");
    this.closeMenu = openChoice(
      this.body,
      // Where the hand let go, in the body's own pixels, which may have been moved up under its frame.
      { left: Math.max(8, Math.min(where.x - box.left, box.width - 260)) + this.body.scrollLeft, top: Math.max(8, where.y - box.top) + this.body.scrollTop },
      asked,
      choices,
      (at) => {
        const wire = wires[at];
        if (wire) this.join(base, wire, lifted);
      },
      () => {
        this.closeMenu = null;
        this.say();
      },
    );
  }

  /** A conduit asked for at a pad beside an output: the module pressed next is what it feeds. Asked for again, it is let go. */
  private feed(node: string, pin: string): void {
    const { running } = this;
    this.closeMenu?.();
    this.running = running && !running.held && running.from.node === node && running.from.pin === pin ? null : { from: { node, pin, port: pin }, lifted: null, held: false };
    this.render();
  }

  /** The conduit into an input, taken out: the input is written by hand again. */
  private cut(node: string, pin: string): void {
    this.work.edit(withoutWires(this.work.now, { node, pin }, "input"));
    this.note("Conduit taken out. Undo brings it back.");
  }

  /** The conduit being run is let go of, and nothing is changed. */
  private endRun(): void {
    this.letGo?.();
    this.running = null;
    this.render();
  }

  private openText(): void {
    openTextPanel(this.body, this.work.text(), this.setting.kit, (text) => this.work.edit(this.work.laidOut(text)));
  }

  private async share(): Promise<void> {
    const link = this.work.link();
    try {
      await this.setting.copy(link);
      this.note("A link to this blueprint, as it is now, is copied: whoever opens it sees it so.");
    } catch {
      this.note(link);
    }
  }

  /** The page's blueprints, to open any of them here; pressed again, put away. */
  private toggleExamples(): void {
    const open = this.element.querySelector(".wb-examples");
    if (open) open.remove();
    else openExamples(this.body, this.setting.examples, this.work.example, (example) => this.open(example));
  }

  /** The example after the one open, or before it, round and round: the page's blueprints leafed through. */
  private flip(by: number): void {
    const { examples } = this.setting;
    const at = examples.indexOf(this.work.example);
    const next = examples[(at + by + examples.length) % examples.length];
    if (next) this.open(next);
  }

  /** What pressing does, said where the pads are; pressed again, put away. */
  private toggleHelp(): void {
    const open = this.element.querySelector(".lc-help");
    if (open) return open.remove();
    const line = (pad: string, what: string) => el("li", {}, el("strong", {}, pad), ` ${what}`);
    const close = el("button", { type: "button", class: "wb-help-close", "aria-label": "Close" }, "✕");
    const help = el(
      "div",
      { class: "lc-help", role: "dialog", "aria-label": "How this display is worked" },
      close,
      el(
        "ul",
        {},
        line("Press a module", "to ask what it does, what it takes and what it gives: its inputs are written there."),
        line("Drag the port at a module's end", "onto the module it should feed: the display finds the input that takes it, and asks where several could. Let go where nothing stands, it offers what could take it."),
        line("Drag the port a conduit arrives at", "to lift it: onto another module, or off into nothing, which takes it out."),
        line("Drag a module", "up or down its column to stand it on another row; with Alt, the arrows do it for the one chosen. Its column is the flow's to say. Tidy hands the layout back to the display."),
        line("Feed", "beside an output does the same pad by pad: the module pressed next is fed. Cut, beside an input, takes its conduit out."),
        line("Next", "offers what could come after the module chosen: a press adds it, wired and written."),
        line("Dial", "beside a value puts it on the board; a dial is turned there, or where it is chosen."),
        line("Add", "adds a module of any kind; Remove, or Delete, takes the one chosen away; Undo, or Ctrl+Z, brings it back."),
        line("What moves along a conduit", "is what flows; the brighter pulse is what ran again, which is only what follows the dial that was turned. Flow puts the stream to rest."),
        line("Text", "is the blueprint as it is written, for whatever the pads do not reach. The workbench is a flag away: flags lcars off."),
      ),
    );
    close.addEventListener("click", () => help.remove());
    this.body.append(help);
  }

  /** The flow along the conduits, let go on or put to rest: whatever moves all the while has a pad that stops it. */
  private toggleFlow(): void {
    this.flowing = !this.flowing;
    this.showFlow();
  }

  private showFlow(): void {
    this.element.classList.toggle("flowing", this.flowing && this.onScreen);
    this.keys.flow.setAttribute("aria-pressed", String(this.flowing));
  }

  private full(): boolean {
    return this.element.classList.contains("full");
  }

  private toggleFull(): void {
    const full = !this.full();
    this.element.classList.toggle("full", full);
    document.body.classList.toggle("lc-full-open", full);
    const label = this.keys.full.lastChild;
    if (label) label.textContent = full ? "Back to the page" : "Full display";
    this.keys.full.title = full ? "Back to the page (Esc)" : "Give the display the whole window (Esc to come back)";
  }

  private listen(): void {
    this.schematic.addEventListener("pointerdown", (event) => this.pressed(event));
    this.schematic.addEventListener("click", (event) => {
      if (this.swallow) return void (this.swallow = false);
      // A conduit asked for at a pad is ended by the press after it: on a module, it feeds it.
      if (this.running) return this.drop(this.endAt(event.target), { x: event.clientX, y: event.clientY });
      const module = (event.target as Element | null)?.closest<HTMLElement>("[data-node]");
      // A module pressed again is let go of, and so is one left by pressing where none stands.
      this.choose(module?.dataset["node"] && module.dataset["node"] !== this.chosen ? module.dataset["node"] : null);
    });
    this.element.addEventListener("keydown", (event) => {
      if ((event.target as Element).closest("input, select, textarea, [contenteditable], [role=dialog]")) return;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if ((event.key === "Delete" || event.key === "Backspace") && this.chosen !== null) this.remove(this.chosen);
      else if (event.altKey && (event.key === "ArrowDown" || event.key === "ArrowUp") && this.chosen !== null) this.nudge(event.key === "ArrowDown" ? 1 : -1);
      else if (command && key === "z" && event.shiftKey) this.work.redo();
      else if (command && key === "z") this.work.undo();
      else if (command && key === "y") this.work.redo();
      else if (event.key === "Escape" && this.running) this.endRun();
      else if (event.key === "Escape" && this.full()) this.toggleFull();
      else if (event.key === "Escape" && this.chosen !== null) this.choose(null);
      else return;
      event.preventDefault();
    });
  }
}
