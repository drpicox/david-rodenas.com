import type { Mesh } from "./Mesh";

/** Where a vertex actually sits in space: its direction, out to its radius. */
export function positionOf(mesh: Mesh, vertex: number): [number, number, number] {
  const radius = mesh.radii[vertex] ?? 1;
  return [
    (mesh.directions[vertex * 3] ?? 0) * radius,
    (mesh.directions[vertex * 3 + 1] ?? 0) * radius,
    (mesh.directions[vertex * 3 + 2] ?? 0) * radius,
  ];
}
