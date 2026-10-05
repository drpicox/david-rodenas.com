import type { Blueprint } from "./Blueprint";
import { dialsOf } from "./dialsOf";
import type { Evaluation } from "./Evaluation";
import type { Kit } from "./kitOf";
import { type Markup, tag } from "./tag";

/**
 * A blueprint's board, as the page has it before any script: its dials, each
 * saying what it is set to, then every picture its paint nodes made, in the
 * order they stand on the canvas, each under its node's title and over its
 * caption and whose numbers it shows. A picture that could not be made says
 * why, where it would have been.
 */
export function renderBoard(blueprint: Blueprint, kit: Kit, evaluation: Evaluation, read: (path: string) => string): string {
  const dials = dialsOf(blueprint, kit, read, evaluation);
  const painters = blueprint.nodes.filter((node) => kit.kinds.get(node.kind)?.role === "paint").sort((a, b) => a.y - b.y || a.x - b.x);
  const cards = painters.map((node): Markup => {
    const result = evaluation.get(node.id);
    const title = node.title ?? kit.kinds.get(node.kind)?.title ?? node.kind;
    const painting = result?.state === "done" ? result.painting : undefined;
    if (!painting) {
      const why = result?.state === "failed" ? result.message : result?.state === "missing" ? `it needs ${result.pins.join(", ")}` : "it waits for a node before it";
      return tag("figure", { class: "bp-card unpainted", "data-node": node.id }, tag("figcaption", {}, title), tag("p", { class: "bp-problem" }, why));
    }
    return tag(
      "figure",
      { class: "bp-card", "data-node": node.id },
      tag("figcaption", {}, title),
      tag("div", { class: "bp-painting" }, { html: painting.html }),
      painting.caption ? tag("p", { class: "bp-caption" }, painting.caption) : null,
      (painting.credits ?? []).length > 0 ? tag("p", { class: "bp-credits" }, `Source: ${(painting.credits ?? []).join(" ")}`) : null,
    );
  });
  const dialed = dials.length > 0 ? tag("dl", { class: "bp-dials" }, dials.map((dial) => tag("div", { class: "bp-dial" }, tag("dt", {}, dial.label), tag("dd", {}, dial.said)))) : null;
  return tag("div", { class: "bp-board" }, dialed, cards).html;
}
