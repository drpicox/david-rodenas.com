import type { Blueprint } from "./Blueprint";

/** A node renamed; renamed to nothing, it is called what its kind is called again. */
export function withTitle(blueprint: Blueprint, id: string, title: string | undefined): Blueprint {
  return {
    ...blueprint,
    nodes: blueprint.nodes.map((node) => {
      if (node.id !== id) return node;
      const { title: _old, ...rest } = node;
      return title?.trim() ? { ...rest, title: title.trim() } : rest;
    }),
  };
}
