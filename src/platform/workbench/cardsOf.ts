import type { Blueprint } from "../blueprint/Blueprint";
import type { Evaluation } from "../blueprint/Evaluation";
import type { Kit } from "../blueprint/kitOf";
import type { Painting } from "../blueprint/NodeKind";

/** A picture on the board, or why there is none yet. */
export interface Card {
  readonly node: string;
  readonly title: string;
  readonly painting?: Painting;
  readonly problem?: string;
  readonly waiting?: boolean;
}

/**
 * The pictures of a blueprint's board, as a run of it left them: one for
 * every node that paints, in the order the blueprint has them, each under
 * its node's title — or saying why there is none, where the node failed or
 * lacks a wire, or waiting, where it has not answered yet.
 */
export function cardsOf(blueprint: Blueprint, kit: Kit, evaluation: Evaluation): Card[] {
  return blueprint.nodes
    .filter((node) => kit.kinds.get(node.kind)?.role === "paint")
    .map((node): Card => {
      const result = evaluation.get(node.id);
      const title = node.title ?? kit.kinds.get(node.kind)?.title ?? node.kind;
      if (result?.state === "done" && result.painting) return { node: node.id, title, painting: result.painting };
      if (result?.state === "failed") return { node: node.id, title, problem: result.message };
      if (result?.state === "missing") return { node: node.id, title, problem: `Wire a ${result.pins.join(" and a ")} into it.` };
      return { node: node.id, title, waiting: true };
    });
}
