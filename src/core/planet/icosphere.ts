export interface Mesh {
  /** Unit vectors, three numbers per vertex. */
  readonly vertices: Float32Array;
  /** Three vertex indices per face. */
  readonly faces: Uint32Array;
  /** Unit vector of the middle of each face, three numbers per face. */
  readonly centroids: Float32Array;
  readonly faceCount: number;
  readonly vertexCount: number;
}

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

/**
 * An icosahedron, subdivided.
 *
 * This is where the planet starts, and it is why the finished world has flat
 * faces instead of a smooth skin: every face is one triangle of this solid,
 * and the count of them is a decision, not an accident. Level 0 is the twenty
 * faces of the solid itself; each level after that quarters them.
 */
export function buildIcosphere(subdivisions: number): Mesh {
  let points = CORNERS.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    return [x / length, y / length, z / length] as [number, number, number];
  });
  let triangles = TRIANGLES.map((face) => [...face] as [number, number, number]);

  for (let level = 0; level < subdivisions; level += 1) {
    const middles = new Map<string, number>();

    const middleOf = (a: number, b: number): number => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const known = middles.get(key);
      if (known !== undefined) return known;

      const [ax, ay, az] = points[a]!;
      const [bx, by, bz] = points[b]!;
      const [mx, my, mz] = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];
      const length = Math.hypot(mx, my, mz);
      points.push([mx / length, my / length, mz / length]);

      const index = points.length - 1;
      middles.set(key, index);
      return index;
    };

    triangles = triangles.flatMap(([a, b, c]) => {
      const ab = middleOf(a, b);
      const bc = middleOf(b, c);
      const ca = middleOf(c, a);
      return [
        [a, ab, ca],
        [b, bc, ab],
        [c, ca, bc],
        [ab, bc, ca],
      ] as [number, number, number][];
    });
  }

  const vertices = new Float32Array(points.length * 3);
  points.forEach(([x, y, z], index) => {
    vertices[index * 3] = x;
    vertices[index * 3 + 1] = y;
    vertices[index * 3 + 2] = z;
  });

  const faces = new Uint32Array(triangles.length * 3);
  const centroids = new Float32Array(triangles.length * 3);
  triangles.forEach(([a, b, c], face) => {
    faces[face * 3] = a;
    faces[face * 3 + 1] = b;
    faces[face * 3 + 2] = c;
    const x = (vertices[a * 3]! + vertices[b * 3]! + vertices[c * 3]!) / 3;
    const y = (vertices[a * 3 + 1]! + vertices[b * 3 + 1]! + vertices[c * 3 + 1]!) / 3;
    const z = (vertices[a * 3 + 2]! + vertices[b * 3 + 2]! + vertices[c * 3 + 2]!) / 3;
    const length = Math.hypot(x, y, z);
    centroids[face * 3] = x / length;
    centroids[face * 3 + 1] = y / length;
    centroids[face * 3 + 2] = z / length;
  });

  return { vertices, faces, centroids, faceCount: triangles.length, vertexCount: points.length };
}
