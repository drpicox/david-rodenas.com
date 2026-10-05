import type { Blueprint } from "./Blueprint";
import type { Literal } from "./NodeKind";

/** A value written on one input of one node, or rubbed out, when it is none, so the input starts where its kind says. */
export function withValue(blueprint: Blueprint, id: string, pin: string, value: Literal | undefined): Blueprint {
  return {
    ...blueprint,
    nodes: blueprint.nodes.map((node) => {
      if (node.id !== id) return node;
      const { [pin]: _gone, ...rest } = node.values;
      return { ...node, values: value === undefined ? rest : { ...rest, [pin]: value } };
    }),
  };
}
