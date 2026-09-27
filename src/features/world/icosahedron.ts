import type { Mesh } from "./Mesh";
import { meshOf } from "./meshOf";

const PHI = (1 + Math.sqrt(5)) / 2;

/** The twelve corners of an icosahedron: three golden rectangles, crossed. */
const CORNERS: readonly (readonly [number, number, number])[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];

const TRIANGLES: readonly (readonly [number, number, number])[] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

/** The solid the whole thing starts from: twenty faces, all at radius one. */
export function icosahedron(): Mesh {
  const vertices = CORNERS.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    return { direction: [x / length, y / length, z / length] as [number, number, number], radius: 1, surface: 0 };
  });
  return meshOf(vertices, TRIANGLES.map((face) => [...face] as [number, number, number]));
}
