import type { Example } from "../../../platform/blueprint/examplesOf";
import { withoutNodes } from "../../../platform/blueprint/withoutNodes";
import { withTitle } from "../../../platform/blueprint/withTitle";
import { el } from "../../../platform/browser/el";
import type { Bench, BenchSetting } from "../../../platform/plugin/Bench";
import { BoardView } from "../../../platform/workbench/browser/BoardView";
import { morphInto } from "../../../platform/workbench/browser/morphInto";
import { openExamples } from "../../../platform/workbench/browser/openExamples";
import { openKindMenu } from "../../../platform/workbench/browser/openKindMenu";
import { openTextPanel } from "../../../platform/workbench/browser/openTextPanel";
import { OpenBlueprint } from "../../../platform/workbench/OpenBlueprint";
import { SCHEMATIC } from "../SCHEMATIC";
import { schematicMarkup } from "../schematicMarkup";
import { QueryView } from "./QueryView";

const HINT = "Press a module to ask what it takes and gives, and what could come next. Nothing is dragged on this display.";
/** What a hand can write: a kind whose every input is one of these can be added with nothing wired into it. */
const WRITTEN = new Set(["number", "text", "flag"]);
/** How wide the menu of kinds is with its words beside its list. */
const MENU_SIDE = 580;
const two = (count: number) => String(count).padStart(2, "0");

/**
 * A blueprint as a starship's display would show it, and work it. The same
 * program, the same nodes and the same data as the workbench; another idea
 * of what hands do. Nothing here is dragged: the display lays the modules
 * out itself, on a grid, and a blueprint is worked on by pressing — a module,
 * to ask what it takes and gives; a pad, to add what could come next, to
 * take it away again, to go back. Every figure on a pad is a real one, and a
 * module is seen to run: a pulse goes along the conduits out of whatever
 * ran again, which is only what follows the dial that was turned.
 *
 * A trial, and a small one on purpose: wires are not drawn by hand here, nor
 * modules placed. The text of the blueprint is a pad away, for whatever the
 * pads do not reach, and the workbench a flag away.
 */
export class LcarsConsole implements Bench {
  readonly element: HTMLElement;
  /** The blueprint open here: its history, its runs, the reader's own version of it. This display only draws it, and hands it what pads do. */
  private readonly work: OpenBlueprint;
  private chosen: string | null = null;
  private pointed: string | null = null;
  private closeMenu: (() => void) | null = null;
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
  private readonly keys: Record<"examples" | "undo" | "redo" | "reset" | "full", HTMLButtonElement>;

  constructor(private readonly setting: BenchSetting) {
    // Kept without where the nodes stand: this display never placed them, and the workbench tidies what does not say.
    this.work = new OpenBlueprint(setting, () => this.render(), { positions: false });

    this.query = new QueryView(setting.kit, {
      write: (node, pin, value, done) => this.work.write(node, pin, value, done),
      promote: (node, pin) => this.promote(node, pin),
      go: (node) => this.choose(node),
      follow: (node, label) => this.follow(node, label),
      remove: (node) => this.remove(node),
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
      key("add", "Add", "Add a module that needs nothing wired into it: a source, a table of your own, a note", () => this.add()),
      this.keys.undo,
      this.keys.redo,
      this.keys.reset,
      key("text", "Text", "The blueprint as text, to read, copy or write", () => this.openText()),
      key("link", "Link", "Copy a link to the blueprint as it is now", () => void this.share()),
      key("help", "Help", "How this display is worked", () => this.toggleHelp()),
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
    this.say();
  }

  /** The schematic, drawn again in place: a module that is still there is the same element, so a pulse along it is not cut short. */
  private drawSchematic(): void {
    const { now: blueprint, evaluation, runs } = this.work;
    // A dial says what it is set to as the board does: a station by its name, not its code.
    const set = new Map(this.work.dials().map((dial) => [dial.node, dial.said]));
    morphInto(this.schematic, schematicMarkup({ blueprint, kit: this.setting.kit, evaluation, chosen: this.chosen, pointed: this.pointed, runs, set, read: this.setting.files.read }));
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
    });
  }

  /** The line under the display: what was just done, or how to begin. */
  private say(words?: string): void {
    this.status.textContent = words ?? (this.work.notice || HINT);
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

  /** The kinds that can be added with nothing wired into them, since no wire is drawn by hand here: every input of theirs can be written. */
  private standing() {
    const { kit } = this.setting;
    return { kinds: new Map([...kit.kinds].filter(([, kind]) => this.work.offers(kind) && kind.role !== "dial" && kind.inputs.every((pin) => WRITTEN.has(pin.type)))), types: kit.types };
  }

  /** The menu of what can stand on its own: chosen, it is added and chosen, and what could come after it offered. */
  private add(): void {
    if (this.closeMenu) return this.closeMenu();
    const box = this.body.getBoundingClientRect();
    this.say("Choose what to add, typing to narrow it; Escape closes the menu. What follows it is offered once it is chosen.");
    this.closeMenu = openKindMenu(
      this.body,
      this.standing(),
      { left: 8, top: 8, ...(box.height > 0 && { height: Math.max(200, Math.min(420, box.height - 16)) }), side: box.width >= MENU_SIDE + 16 },
      undefined,
      // Where it stands is the schematic's to say.
      ({ kind }) => this.choose(this.work.add(kind.name, { x: 0, y: 0 })),
      () => {
        this.closeMenu = null;
        this.say();
      },
    );
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
        line("Next", "offers what could come after the module chosen: a press adds it, wired and written."),
        line("An input that comes from another module", "says which: a press goes there."),
        line("Dial", "beside a value puts it on the board; a dial is turned there, or where it is chosen."),
        line("Add", "adds what needs nothing wired into it: a source, a table of your own, a note."),
        line("Remove, or Delete,", "takes the module chosen away; Undo, or Ctrl+Z, brings it back."),
        line("A pulse along a conduit", "is what ran again: turning a dial runs only what follows it."),
        line("Text", "is the blueprint as it is written, for whatever the pads do not reach. Wires are not drawn by hand here: the workbench is a flag away, flags lcars off."),
      ),
    );
    close.addEventListener("click", () => help.remove());
    this.body.append(help);
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
    this.schematic.addEventListener("click", (event) => {
      const module = (event.target as Element | null)?.closest<HTMLElement>("[data-node]");
      // A module pressed again is let go of, and so is one left by pressing where none stands.
      this.choose(module?.dataset["node"] && module.dataset["node"] !== this.chosen ? module.dataset["node"] : null);
    });
    this.element.addEventListener("keydown", (event) => {
      if ((event.target as Element).closest("input, select, textarea, [contenteditable], [role=dialog]")) return;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if ((event.key === "Delete" || event.key === "Backspace") && this.chosen !== null) this.remove(this.chosen);
      else if (command && key === "z" && event.shiftKey) this.work.redo();
      else if (command && key === "z") this.work.undo();
      else if (command && key === "y") this.work.redo();
      else if (event.key === "Escape" && this.full()) this.toggleFull();
      else if (event.key === "Escape" && this.chosen !== null) this.choose(null);
      else return;
      event.preventDefault();
    });
  }
}
