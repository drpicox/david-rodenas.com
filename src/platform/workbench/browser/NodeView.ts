import { el } from "../../browser/el";
import type { PlacedNode } from "../../blueprint/Blueprint";
import type { NodeResult } from "../../blueprint/Evaluation";
import { footOf } from "../../blueprint/footOf";
import type { Kit } from "../../blueprint/kitOf";
import type { InputPin, Literal } from "../../blueprint/NodeKind";
import { nodeShapeOf } from "../../blueprint/nodeShapeOf";
import type { Resolved } from "../../blueprint/resolvedEditor";
import { type Control, controlFor } from "./controlFor";

/** What a node's view is told to show: the node, what was made of it, which of its pins are wired, how each input is written, and whether it is chosen. */
export interface NodeShown {
  readonly node: PlacedNode;
  readonly result: NodeResult | undefined;
  readonly wiredIn: ReadonlySet<string>;
  readonly wiredOut: ReadonlySet<string>;
  readonly editors: ReadonlyMap<string, Resolved>;
  readonly selected: boolean;
  /** What the foot says instead of what came out, when the holder knows better: a dial says its value by name. */
  readonly foot?: string;
}

/** What a node's view asks of whoever holds the blueprint. */
export interface NodeHands {
  /** A value written on an input, or rubbed out; done when the hand that wrote it has let go. */
  write(node: string, pin: string, value: Literal | undefined, done: boolean): void;
  /** An input put on the board as a dial. */
  promote(node: string, pin: string): void;
  rename(node: string, title: string): void;
}

/** A primitive that a dial can stand for: numbers, words, yes and no. */
const DIALLED = new Set(["number", "text", "flag"]);

/**
 * One node on the canvas, as Unreal draws one: a header in its role's
 * colour, its outputs on the right, its inputs on the left, each with the
 * control that writes it while no wire does, and a foot that says what came
 * out. It is built once and told what to show again and again; a control a
 * hand is in is never rebuilt under it.
 */
export class NodeView {
  readonly element: HTMLElement;
  private readonly title: HTMLElement;
  private readonly foot: HTMLElement;
  private readonly rows = new Map<string, { row: HTMLElement; pin: HTMLElement; edit: HTMLElement; signature: string; control: Control | null }>();
  private readonly outs = new Map<string, HTMLElement>();
  private kind = "";

  constructor(
    private readonly kit: Kit,
    private readonly id: string,
    private readonly hands: NodeHands,
  ) {
    this.title = el("span", { class: "wb-title" });
    this.foot = el("footer", { class: "wb-foot" });
    this.element = el("div", { class: "wb-node", "data-node": id });
    this.title.addEventListener("dblclick", () => this.renaming());
  }

  show({ node, result, wiredIn, wiredOut, editors, selected, foot: said }: NodeShown): void {
    const kind = this.kit.kinds.get(node.kind);
    if (this.kind !== node.kind) this.build(node);
    const shape = nodeShapeOf(kind);
    const foot = said !== undefined && (result === undefined || result.state === "done") ? { said, trouble: false } : footOf(result, node.kind);
    this.element.className = ["wb-node", `wb-role-${kind?.role ?? "unknown"}`, selected ? "selected" : "", foot.trouble ? "trouble" : "", result?.state === "waiting" ? "waiting" : ""].filter(Boolean).join(" ");
    this.element.style.left = `${node.x}px`;
    this.element.style.top = `${node.y}px`;
    this.element.style.height = `${shape.height}px`;
    if (this.title.getAttribute("contenteditable") !== "true") this.title.textContent = node.title ?? kind?.title ?? node.kind;
    this.foot.textContent = foot.said;
    this.foot.title = foot.said;
    for (const [pin, out] of this.outs) out.classList.toggle("open", !wiredOut.has(pin));
    const settled = result?.state === "done" ? result.settled : {};
    for (const input of kind?.inputs ?? []) {
      const row = this.rows.get(input.name);
      if (!row) continue;
      const wired = wiredIn.has(input.name);
      row.pin.classList.toggle("open", !wired);
      row.row.classList.toggle("wired", wired);
      const editor = editors.get(input.name);
      if (wired || !editor) {
        row.edit.replaceChildren();
        row.control = null;
        row.signature = "";
        continue;
      }
      this.showControl(node, input, row, editor, settled[input.name]);
    }
  }

  /** The rows a kind has, built once: rebuilt only if the node becomes another kind. */
  private build(node: PlacedNode): void {
    const kind = this.kit.kinds.get(node.kind);
    this.kind = node.kind;
    this.rows.clear();
    this.outs.clear();
    const colour = (type: string) => `var(${this.kit.types.get(type)?.colour ?? "--dim"})`;
    const outputs = (kind?.outputs ?? []).map((pin) => {
      const dot = el("span", { class: "wb-pin open", "data-pin": pin.name, "data-side": "output", style: `--pin: ${colour(pin.type)}`, title: `${pin.label}: ${this.kit.types.get(pin.type)?.label ?? pin.type}` });
      this.outs.set(pin.name, dot);
      return el("div", { class: "wb-row wb-out" }, el("span", { class: "wb-label" }, pin.label), dot);
    });
    const shape = nodeShapeOf(kind);
    const inputs = (kind?.inputs ?? []).map((pin) => {
      const dot = el("span", { class: "wb-pin open", "data-pin": pin.name, "data-side": "input", style: `--pin: ${colour(pin.type)}`, title: `${pin.label}: ${this.kit.types.get(pin.type)?.label ?? pin.type}${pin.hint ? ` — ${pin.hint}` : ""}` });
      const edit = el("span", { class: "wb-edit" });
      const row = el("div", { class: "wb-row wb-in", style: `height: calc(var(--bp-row) * ${shape.rows.get(pin.name) ?? 1})` }, dot, pin.label ? el("span", { class: "wb-label" }, pin.label) : null, edit);
      this.rows.set(pin.name, { row, pin: dot, edit, signature: "", control: null });
      return row;
    });
    const header = el("header", { class: "wb-head", title: kind?.summary ?? `There is no kind of node called ${node.kind}.` }, el("span", { class: "wb-glyph", "aria-hidden": "true" }), this.title);
    this.element.replaceChildren(header, ...outputs, ...inputs, this.foot);
  }

  /** The control of one input, built again only when how it is written changed, and never while a hand is in it. */
  private showControl(node: PlacedNode, input: InputPin, row: { edit: HTMLElement; signature: string; control: Control | null }, editor: Resolved, settled: Literal | undefined): void {
    const signature = JSON.stringify([editor, settled ?? null]);
    // A list or a box shows what the input starts with; a field is left empty, saying it in grey, so that rubbing it out goes back to it.
    const picked = editor.kind === "choice" || editor.kind === "flag";
    const value = node.values[input.name] ?? (picked ? input.initial : undefined);
    if (row.control && row.signature === signature) {
      row.control.show(value);
      return;
    }
    if (row.control && row.edit.contains(row.edit.ownerDocument.activeElement)) return;
    const shownSettled = settled ?? input.initial;
    const control = controlFor(editor, value, {
      style: "inline",
      optional: input.optional === true || (!picked && input.initial !== undefined),
      ...(shownSettled !== undefined && { settled: String(shownSettled) }),
      label: input.label || input.name,
      changed: (written, done) => this.hands.write(this.id, input.name, written, done),
    });
    const promote = DIALLED.has(input.type) && this.kit.kinds.get(node.kind)?.role !== "dial" && this.kit.kinds.get(node.kind)?.role !== "note" ? el("button", { type: "button", class: "wb-promote", title: "Put it on the board, as a dial", "aria-label": `Put ${input.label || input.name} on the board as a dial` }, "◉") : null;
    promote?.addEventListener("click", () => this.hands.promote(this.id, input.name));
    row.edit.replaceChildren(control.element, ...(promote ? [promote] : []));
    row.control = control;
    row.signature = signature;
  }

  /** The title made writable in place; Enter or leaving it renames the node, Escape leaves it as it was. */
  private renaming(): void {
    const before = this.title.textContent ?? "";
    this.title.setAttribute("contenteditable", "true");
    this.title.focus();
    const done = (keep: boolean) => {
      this.title.removeAttribute("contenteditable");
      this.title.removeEventListener("blur", blurred);
      this.title.removeEventListener("keydown", key);
      if (keep && this.title.textContent !== before) this.hands.rename(this.id, this.title.textContent ?? "");
      else this.title.textContent = before;
    };
    const blurred = () => done(true);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        done(true);
      } else if (event.key === "Escape") done(false);
      event.stopPropagation();
    };
    this.title.addEventListener("blur", blurred);
    this.title.addEventListener("keydown", key);
  }
}
