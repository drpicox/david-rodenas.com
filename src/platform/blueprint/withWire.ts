import type { Blueprint, Wire } from "./Blueprint";

/**
 * The blueprint with a wire into an input, standing where the one that was
 * wired into it stood, if there was one: an input takes one thing, while an
 * output can feed many.
 */
export function withWire(blueprint: Blueprint, wire: Wire): Blueprint {
  const into = ({ to }: Wire) => to.node === wire.to.node && to.pin === wire.to.pin;
  const replaced = blueprint.wires.some(into);
  return { ...blueprint, wires: replaced ? blueprint.wires.map((each) => (into(each) ? wire : each)) : [...blueprint.wires, wire] };
}
