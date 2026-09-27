import type { Mesh } from "./Mesh";
import { meshOf, type Vertex } from "./meshOf";

/**
 * How far the midpoint of an edge is pushed out or pulled in when the edge is
 * split. The length is passed in because that is what makes the result
 * fractal: it halves at every level, so the first splits carve continents and
 * the last ones only roughen a slope.
 */
export type Displace = (length: number) => number;

/** The surface type of a new midpoint, from the two ends of its edge. Plain average unless told otherwise. */
export type Blend = (a: number, b: number) => number;
const AVERAGE: Blend = (a, b) => (a + b) / 2;

/**
 * Subdivide, displacing each new midpoint along its own radius.
 *
 * This is the original algorithm and not the usual one: the corners that already
 * existed keep the height they had, and only the new points move. Smoothing
 * the old ones as well would average the mountains away, which is exactly what
 * a fractal landscape must not do.
 */
export function subdivide(mesh: Mesh, displace: Displace, blend: Blend = AVERAGE): Mesh {
  const vertices: Vertex[] = Array.from({ length: mesh.vertexCount }, (_unused, index) => ({
    direction: [
      mesh.directions[index * 3] ?? 0,
      mesh.directions[index * 3 + 1] ?? 0,
      mesh.directions[index * 3 + 2] ?? 0,
    ],
    radius: mesh.radii[index] ?? 1,
    surface: mesh.surface[index] ?? 0,
  }));

  const middles = new Map<string, number>();

  const middleOf = (a: number, b: number): number => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const known = middles.get(key);
    if (known !== undefined) return known;

    const first = vertices[a]!;
    const second = vertices[b]!;
    const [ax, ay, az] = first.direction;
    const [bx, by, bz] = second.direction;

    const length = Math.hypot(
      ax * first.radius - bx * second.radius,
      ay * first.radius - by * second.radius,
      az * first.radius - bz * second.radius,
    );

    const [mx, my, mz] = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];
    const scale = Math.hypot(mx, my, mz) || 1;

    // The texture is drawn before the height, as the original code drew them.
    const surface = blend(first.surface, second.surface);
    vertices.push({
      direction: [mx / scale, my / scale, mz / scale],
      radius: (first.radius + second.radius) / 2 + displace(length),
      surface,
    });

    const index = vertices.length - 1;
    middles.set(key, index);
    return index;
  };

  const faces: [number, number, number][] = [];
  for (let face = 0; face < mesh.faceCount; face += 1) {
    const a = mesh.faces[face * 3]!;
    const b = mesh.faces[face * 3 + 1]!;
    const c = mesh.faces[face * 3 + 2]!;
    const ab = middleOf(a, b);
    const bc = middleOf(b, c);
    const ca = middleOf(c, a);
    faces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }

  return meshOf(vertices, faces);
}
