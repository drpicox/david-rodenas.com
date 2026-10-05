import type { Blueprint, PinRef } from "./Blueprint";

/** The blueprint without the wire into an input, or without every wire out of an output: what a hand on a pin lets go of. */
export function withoutWires(blueprint: Blueprint, pin: PinRef, side: "input" | "output"): Blueprint {
  const end = (wire: Blueprint["wires"][number]) => (side === "input" ? wire.to : wire.from);
  return { ...blueprint, wires: blueprint.wires.filter((wire) => end(wire).node !== pin.node || end(wire).pin !== pin.pin) };
}
