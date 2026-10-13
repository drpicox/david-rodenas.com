import type { Wire } from "../../platform/blueprint/Blueprint";
import type { Conduit, Schematic } from "./schematicOf";

const longOf = ({ points }: Conduit) => points.reduce((sum, point, index) => sum + (index > 0 ? Math.abs(point.x - (points[index - 1]?.x ?? 0)) + Math.abs(point.y - (points[index - 1]?.y ?? 0)) : 0), 0);

/**
 * How far along the flow each conduit sets out, in pixels: what a stream
 * drawn along it is put that much out of step by, so that what leaves a
 * module is seen to be what came into it a module's width before, the whole
 * blueprint over, with one movement for every conduit. A module nothing
 * feeds lets go where it stands, as a front crossing the display from the
 * left would reach it; one that is fed, when the last of what it is fed has
 * come the length of its conduit and crossed it.
 */
export function flowOf(schematic: Schematic): Map<Wire, number> {
  const modules = new Map(schematic.modules.map((module) => [module.id, module]));
  const leaving = new Map<string, number>();
  /** Where the flow is as it leaves a module. Wires that go round in a circle are followed once. */
  const leaves = (id: string, seen: ReadonlySet<string>): number => {
    const known = leaving.get(id);
    if (known !== undefined) return known;
    const module = modules.get(id);
    const into = schematic.conduits.filter(({ wire }) => wire.to.node === id && !seen.has(wire.from.node));
    const arrived = into.length > 0 ? Math.max(...into.map((conduit) => leaves(conduit.wire.from.node, new Set([...seen, id])) + longOf(conduit))) : (module?.x ?? 0);
    const far = Math.round(arrived + (module?.width ?? 0));
    leaving.set(id, far);
    return far;
  };
  return new Map(schematic.conduits.map(({ wire }) => [wire, leaves(wire.from.node, new Set())]));
}
