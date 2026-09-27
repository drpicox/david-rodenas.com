import type { Mesh } from "./Mesh";

/** A corner while a mesh is being built: where it points, how far out, and what surface it is. */
export interface Vertex {
  direction: [number, number, number];
  radius: number;
  surface: number;
}

/** Corners and triangles packed into the typed arrays a mesh is kept in. */
export function meshOf(vertices: readonly Vertex[], faces: readonly (readonly [number, number, number])[]): Mesh {
  const directions = new Float32Array(vertices.length * 3);
  const radii = new Float32Array(vertices.length);
  const surface = new Float32Array(vertices.length);
  vertices.forEach((vertex, index) => {
    directions[index * 3] = vertex.direction[0];
    directions[index * 3 + 1] = vertex.direction[1];
    directions[index * 3 + 2] = vertex.direction[2];
    radii[index] = vertex.radius;
    surface[index] = vertex.surface;
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
    surface,
    faces: indices,
    faceCount: faces.length,
    vertexCount: vertices.length,
  };
}
