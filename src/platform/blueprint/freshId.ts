import type { Blueprint } from "./Blueprint";

/** A name for a new node that no node of the blueprint has: its kind's, or its kind's with a number. */
export function freshId(blueprint: Blueprint, base: string): string {
  const taken = new Set(blueprint.nodes.map((node) => node.id));
  let id = base;
  for (let count = 2; taken.has(id); count += 1) id = `${base}-${count}`;
  return id;
}
