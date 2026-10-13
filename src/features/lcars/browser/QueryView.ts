import type { PlacedNode } from "../../../platform/blueprint/Blueprint";
import type { NodeResult } from "../../../platform/blueprint/Evaluation";
import { footOf } from "../../../platform/blueprint/footOf";
import type { Kit } from "../../../platform/blueprint/kitOf";
import type { InputPin, Literal } from "../../../platform/blueprint/NodeKind";
import { peekOf } from "../../../platform/blueprint/peekOf";
import type { Resolved } from "../../../platform/blueprint/resolvedEditor";
import { tag } from "../../../platform/blueprint/tag";
import { el } from "../../../platform/browser/el";
import { type Control, controlFor } from "../../../platform/workbench/browser/controlFor";
import { morphInto } from "../../../platform/workbench/browser/morphInto";

/** What the query is told to show of the module chosen. */
export interface QueryShown {
  readonly node: PlacedNode;
  readonly result: NodeResult | undefined;
  /** The module each wired input comes from, and how that is said. */
  readonly from: ReadonlyMap<string, { readonly node: string; readonly said: string }>;
  readonly editors: ReadonlyMap<string, Resolved>;
  /** What could come after it, a press away: what each pad says, and the kind of node it adds. */
  readonly next: readonly { readonly label: string; readonly kind: string }[];
  /** What it says instead of what came out, when the holder knows better: a dial says its value by name. */
  readonly said?: string;
  /** The output of it a conduit is being run from, pad by pad, while one is. */
  readonly feeding?: string;
}

/** What the query asks of whoever holds the blueprint. */
export interface QueryHands {
  write(node: string, pin: string, value: Literal | undefined, done: boolean): void;
  /** An input put on the board, as a dial. */
  promote(node: string, pin: string): void;
  /** Another module chosen: the one an input comes from. */
  go(node: string): void;
  /** A next step taken, named by what its pad says. */
  follow(node: string, label: string): void;
  remove(node: string): void;
  /** A conduit to be run from an output: the module pressed next is what it feeds. */
  feed(node: string, pin: string): void;
  /** The conduit into an input, taken out. */
  cut(node: string, pin: string): void;
}

/** A primitive that a dial can stand for: numbers, words, yes and no. */
const DIALLED = new Set(["number", "text", "flag"]);

/**
 * The module chosen, asked what it is — as a panel of a starship answers
 * when a system on its diagram is pressed: what it does, what it takes, each
 * input written here or said to come from another module — with a pad that
 * takes that conduit out — what it gives, with a look at it and a pad that
 * runs a conduit from it, and pads for what could come next. Everything a node
 * of the workbench carries on its own face is here instead, so the schematic
 * stays a diagram. A control a hand is in is never rebuilt under it.
 */
export class QueryView {
  readonly element: HTMLElement;
  private readonly title = el("span", { class: "lc-query-name" });
  private readonly kindSaid = el("span", { class: "lc-query-kind" });
  private readonly summary = el("p", { class: "lc-query-summary" });
  private readonly said = el("p", { class: "lc-query-said" });
  private readonly takes = el("dl", { class: "lc-takes" });
  private readonly gives = el("dl", { class: "lc-gives" });
  private readonly next = el("div", { class: "lc-next", role: "toolbar", "aria-label": "What could come next" });
  private readonly rows = new Map<string, { row: HTMLElement; value: HTMLElement; signature: string; control: Control | null }>();
  private shown: { id: string; kind: string } | null = null;
  private offered = "";

  constructor(
    private readonly kit: Kit,
    private readonly hands: QueryHands,
  ) {
    const remove = el("button", { type: "button", class: "lc-remove", title: "Take this module out of the blueprint (Delete)" }, "Remove");
    remove.addEventListener("click", () => this.shown && this.hands.remove(this.shown.id));
    this.element = el(
      "section",
      { class: "lc-deck lc-query", "aria-label": "The module chosen", hidden: true },
      el("p", { class: "lc-deck-head" }, el("span", { class: "lc-deck-name" }, "Query"), this.title, this.kindSaid, remove),
      el("div", { class: "lc-query-body" }, el("div", { class: "lc-query-what" }, this.summary, this.said), this.takes, this.gives),
      this.next,
    );
    // What it gives is drawn again in place, pads and all: one ear hears whichever is pressed.
    this.gives.addEventListener("click", (event) => {
      const pin = (event.target as Element).closest<HTMLElement>(".lc-feed")?.dataset["feed"];
      if (pin !== undefined && this.shown) this.hands.feed(this.shown.id, pin);
    });
  }

  show(shown: QueryShown | null): void {
    this.element.hidden = shown === null;
    if (!shown) {
      this.shown = null;
      return;
    }
    const { node, result } = shown;
    const kind = this.kit.kinds.get(node.kind);
    if (this.shown?.id !== node.id || this.shown.kind !== node.kind) this.build(node);
    const foot = footOf(result, node.kind);
    this.title.textContent = node.title ?? kind?.title ?? node.kind;
    this.kindSaid.textContent = node.title !== undefined && kind && node.title !== kind.title ? kind.title : "";
    this.summary.textContent = kind?.summary ?? `There is no kind of node called ${node.kind}.`;
    this.said.textContent = shown.said ?? foot.said;
    this.said.classList.toggle("trouble", foot.trouble);
    const settled = result?.state === "done" ? result.settled : {};
    for (const input of kind?.inputs ?? []) {
      const row = this.rows.get(input.name);
      if (!row) continue;
      const from = shown.from.get(input.name);
      const editor = shown.editors.get(input.name);
      row.row.classList.toggle("wired", from !== undefined);
      if (from) this.showFrom(node, input, row, from);
      else if (editor) this.showControl(node, input, row, editor, settled[input.name]);
    }
    this.showGives(shown);
    this.showNext(shown);
  }

  /** The rows a kind has, built once: rebuilt only when another module is chosen, or this one becomes another kind. */
  private build(node: PlacedNode): void {
    const kind = this.kit.kinds.get(node.kind);
    this.shown = { id: node.id, kind: node.kind };
    this.rows.clear();
    this.offered = "";
    this.takes.replaceChildren(
      ...(kind?.inputs ?? []).map((pin) => {
        const value = el("dd", {});
        const dot = el("i", { class: "lc-port", style: `--pin: var(${this.kit.types.get(pin.type)?.colour ?? "--dim"})`, "aria-hidden": "true" });
        const row = el("div", { class: "lc-take", "data-pin": pin.name, title: `${this.kit.types.get(pin.type)?.label ?? pin.type}${pin.hint ? ` — ${pin.hint}` : ""}` }, el("dt", {}, dot, pin.label || pin.name), value);
        this.rows.set(pin.name, { row, value, signature: "", control: null });
        return row;
      }),
    );
    this.next.replaceChildren();
  }

  /** A wired input says where it comes from, as a pad that goes there, with one beside it that takes the conduit out. */
  private showFrom(node: PlacedNode, input: InputPin, row: { value: HTMLElement; signature: string; control: Control | null }, from: { node: string; said: string }): void {
    const signature = `from:${from.node}:${from.said}`;
    if (row.signature === signature) return;
    const go = el("button", { type: "button", class: "lc-from", title: "Go to the module it comes from" }, from.said);
    go.addEventListener("click", () => this.hands.go(from.node));
    const cut = el("button", { type: "button", class: "lc-cut", title: "Take this conduit out: the input is written by hand again", "aria-label": `Take out the conduit into ${input.label || input.name}` }, "Cut");
    cut.addEventListener("click", () => this.hands.cut(node.id, input.name));
    row.value.replaceChildren(go, cut);
    row.control = null;
    row.signature = signature;
  }

  /** The control of one input, built again only when how it is written changed, and never while a hand is in it. */
  private showControl(node: PlacedNode, input: InputPin, row: { value: HTMLElement; signature: string; control: Control | null }, editor: Resolved, settled: Literal | undefined): void {
    const signature = JSON.stringify([editor, settled ?? null]);
    // A list or a box shows what the input starts with; a field is left empty, saying it in grey, so that rubbing it out goes back to it.
    const picked = editor.kind === "choice" || editor.kind === "flag";
    const value = node.values[input.name] ?? (picked ? input.initial : undefined);
    if (row.control && row.signature === signature) return row.control.show(value);
    if (row.control && row.value.contains(row.value.ownerDocument.activeElement)) return;
    const shownSettled = settled ?? input.initial;
    const control = controlFor(editor, value, {
      style: "inline",
      optional: input.optional === true || (!picked && input.initial !== undefined),
      ...(shownSettled !== undefined && { settled: String(shownSettled) }),
      label: input.label || input.name,
      changed: (written, done) => this.hands.write(node.id, input.name, written, done),
    });
    const role = this.kit.kinds.get(node.kind)?.role;
    const promote = DIALLED.has(input.type) && role !== "dial" && role !== "note" ? el("button", { type: "button", class: "lc-promote", title: "Put it on the board, as a dial", "aria-label": `Put ${input.label || input.name} on the board as a dial` }, "Dial") : null;
    promote?.addEventListener("click", () => this.hands.promote(node.id, input.name));
    row.value.replaceChildren(control.element, ...(promote ? [promote] : []));
    row.control = control;
    row.signature = signature;
  }

  /** What each output gives, with a look at it: a table's first rows, a number as it is. */
  private showGives({ node, result, feeding }: QueryShown): void {
    const kind = this.kit.kinds.get(node.kind);
    const html = (kind?.outputs ?? []).map((pin) => {
      const look = result?.state === "done" && pin.name in result.outputs ? peekOf(result.outputs[pin.name], pin.type, this.kit) : tag("p", { class: "bp-peek-said" }, footOf(result, node.kind).said || "It has not run yet.");
      const dot = tag("i", { class: "lc-port", style: `--pin: var(${this.kit.types.get(pin.type)?.colour ?? "--dim"})`, "aria-hidden": "true" });
      const feed = tag("button", { type: "button", class: "lc-feed", "data-feed": pin.name, "aria-pressed": String(feeding === pin.name), title: "Run a conduit from it: the module pressed next is what it feeds" }, "Feed");
      return tag("div", { class: "lc-give", "data-key": `give:${pin.name}`, "data-pin": pin.name }, tag("dt", {}, dot, pin.label || pin.name, feed), tag("dd", { class: "lc-peek" }, look)).html;
    });
    morphInto(this.gives, html.join(""));
    this.gives.hidden = html.length === 0;
  }

  /** The pads for what could come next, built again only when what is offered changes, so one is never pulled from under a hand. */
  private showNext({ node, next }: QueryShown): void {
    const offered = next.map((offer) => offer.label).join("\u0000");
    this.next.hidden = next.length === 0;
    if (offered === this.offered) return;
    this.offered = offered;
    this.next.replaceChildren(
      el("span", { class: "lc-next-said" }, "Next"),
      ...next.map((offer) => {
        const take = el("button", { type: "button", title: `Add it, wired from this module: ${this.kit.kinds.get(offer.kind)?.title ?? offer.kind}` }, offer.label);
        take.addEventListener("click", () => this.hands.follow(node.id, offer.label));
        return take;
      }),
    );
  }
}
