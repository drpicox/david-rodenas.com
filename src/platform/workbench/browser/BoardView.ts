import { el } from "../../browser/el";
import type { Dial } from "../../blueprint/dialsOf";
import type { Literal, Painting } from "../../blueprint/NodeKind";
import { tag } from "../../blueprint/tag";
import { type Control, controlFor } from "./controlFor";
import { morphInto } from "./morphInto";

/** A picture on the board, or why there is none yet. */
export interface Card {
  readonly node: string;
  readonly title: string;
  readonly painting?: Painting;
  readonly problem?: string;
  readonly waiting?: boolean;
}

/** What the board asks of whoever holds the blueprint. */
export interface BoardHands {
  turn(node: string, value: Literal, done: boolean): void;
  /** Bring a node into view on the canvas, and choose it. */
  find(node: string): void;
}

/**
 * The board beside the canvas: the dials, to turn without touching the
 * wiring, and every picture the blueprint paints, under its node's title —
 * a button that finds the node — drawn again in place as the blueprint
 * changes, so a bar that grows is seen growing.
 */
export class BoardView {
  readonly element: HTMLElement;
  private readonly dials = el("div", { class: "wb-dials" });
  private readonly cards = el("div", { class: "wb-cards" });
  private readonly empty = el("p", { class: "wb-empty" }, "The pictures a blueprint paints come here. Add a node from the shelf called Paint — Bars, Lines, Scatter — and wire a table into it.");
  private readonly controls = new Map<string, { element: HTMLElement; control: Control; signature: string }>();

  constructor(private readonly hands: BoardHands) {
    this.element = el("aside", { class: "wb-board", "aria-label": "The board: dials and pictures" }, this.dials, this.cards, this.empty);
    this.cards.addEventListener("click", (event) => {
      const button = (event.target as Element | null)?.closest<HTMLElement>("button[data-node]");
      if (button?.dataset["node"]) this.hands.find(button.dataset["node"]);
    });
  }

  /** The board the build wrote, until the blueprint has run here and the board can be drawn from it. */
  showStill(html: string): void {
    this.cards.innerHTML = html;
    this.empty.hidden = true;
  }

  show(dials: readonly Dial[], cards: readonly Card[]): void {
    this.showDials(dials);
    const html = cards
      .map(
        (card) =>
          tag(
            "figure",
            { class: `bp-card${card.painting ? "" : card.waiting ? " waiting" : " unpainted"}`, "data-key": `card:${card.node}` },
            tag("figcaption", {}, tag("button", { type: "button", class: "wb-find", "data-node": card.node, title: "Find it in the blueprint" }, card.title)),
            card.painting ? tag("div", { class: "bp-painting" }, { html: card.painting.html }) : tag("p", { class: "bp-problem" }, card.problem ?? (card.waiting ? "Fetching its data…" : "")),
            card.painting?.caption ? tag("p", { class: "bp-caption" }, card.painting.caption) : null,
            (card.painting?.credits ?? []).length > 0 ? tag("p", { class: "bp-credits" }, `Source: ${(card.painting?.credits ?? []).join(" ")}`) : null,
          ).html,
      )
      .join("");
    morphInto(this.cards, html);
    this.empty.hidden = cards.length > 0 || dials.length > 0;
  }

  /** A control for each dial, built again only when how it is turned changed, and never under a hand. */
  private showDials(dials: readonly Dial[]): void {
    const wanted = new Set(dials.map((dial) => dial.node));
    for (const [node, kept] of this.controls)
      if (!wanted.has(node)) {
        kept.element.remove();
        this.controls.delete(node);
      }
    dials.forEach((dial, at) => {
      const signature = JSON.stringify([dial.label, dial.editor]);
      let kept = this.controls.get(dial.node);
      if (kept && kept.signature !== signature && !kept.element.contains(kept.element.ownerDocument.activeElement)) {
        kept.element.remove();
        kept = undefined;
      }
      if (!kept) {
        const control = controlFor(dial.editor, dial.value, { style: "dial", label: dial.label, changed: (value, done) => value !== undefined && this.hands.turn(dial.node, value, done) });
        kept = { element: el("label", { class: "wb-dial", "data-node": dial.node }, el("span", { class: "wb-dial-name" }, dial.label), control.element), control, signature };
        this.controls.set(dial.node, kept);
      } else kept.control.show(dial.value);
      if (this.dials.children[at] !== kept.element) this.dials.insertBefore(kept.element, this.dials.children[at] ?? null);
    });
  }
}
