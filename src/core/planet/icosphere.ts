export interface Mesh {
  /** Unit direction of each vertex, three numbers per vertex. */
  readonly directions: Float32Array;
  /** Distance from the centre of each vertex. Relief lives here. */
  readonly radii: Float32Array;
  /** Three vertex indices per face. */
  readonly faces: Uint32Array;
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

interface Vertex {
  direction: [number, number, number];
  radius: number;
}

/** The solid the whole thing starts from: twenty faces, all at radius one. */
export function icosahedron(): Mesh {
  const vertices = CORNERS.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    return { direction: [x / length, y / length, z / length] as [number, number, number], radius: 1 };
  });
  return meshOf(vertices, TRIANGLES.map((face) => [...face] as [number, number, number]));
}

/**
 * How far the midpoint of an edge is pushed out or pulled in when the edge is
 * split. The length is passed in because that is what makes the result
 * fractal: it halves at every level, so the first splits carve continents and
 * the last ones only roughen a slope.
 */
export type Displace = (length: number) => number;

/**
 * Subdivide, displacing each new midpoint along its own radius.
 *
 * This is the 1999 algorithm and not the usual one: the corners that already
 * existed keep the height they had, and only the new points move. Smoothing
 * the old ones as well would average the mountains away, which is exactly what
 * a fractal landscape must not do.
 */
export function subdivide(mesh: Mesh, displace: Displace): Mesh {
  const vertices: Vertex[] = Array.from({ length: mesh.vertexCount }, (_unused, index) => ({
    direction: [
      mesh.directions[index * 3] ?? 0,
      mesh.directions[index * 3 + 1] ?? 0,
      mesh.directions[index * 3 + 2] ?? 0,
    ],
    radius: mesh.radii[index] ?? 1,
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

    vertices.push({
      direction: [mx / scale, my / scale, mz / scale],
      radius: (first.radius + second.radius) / 2 + displace(length),
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

function meshOf(vertices: readonly Vertex[], faces: readonly (readonly [number, number, number])[]): Mesh {
  const directions = new Float32Array(vertices.length * 3);
  const radii = new Float32Array(vertices.length);
  vertices.forEach(({ direction, radius }, index) => {
    directions[index * 3] = direction[0];
    directions[index * 3 + 1] = direction[1];
    directions[index * 3 + 2] = direction[2];
    radii[index] = radius;
  });

  const indices = new Uint32Array(faces.length * 3);
  faces.forEach(([a, b, c], face) => {
    indices[face * 3] = a;
    indices[face * 3 + 1] = b;
    indices[face * 3 + 2] = c;
  });

  return {
    directions,
    radii,
    faces: indices,
    faceCount: faces.length,
    vertexCount: vertices.length,
  };
}

/** Where a vertex actually sits in space: its direction, out to its radius. */
export function positionOf(mesh: Mesh, vertex: number): [number, number, number] {
  const radius = mesh.radii[vertex] ?? 1;
  return [
    (mesh.directions[vertex * 3] ?? 0) * radius,
    (mesh.directions[vertex * 3 + 1] ?? 0) * radius,
    (mesh.directions[vertex * 3 + 2] ?? 0) * radius,
  ];
}
