import { icosahedron, type Mesh } from "./icosphere";

/**
 * A world is a solid with relief, plus everything the filters have decided
 * about it so far. Height is the radius of a corner — not a colour, not a
 * texture — which is why mountains come out through the silhouette instead of
 * being painted onto a ball.
 */
export interface World {
  readonly seed: number;
  readonly mesh: Mesh;
  /** Per vertex, roughly 0..1 where 0 is the coldest pole. */
  readonly temperature: Float32Array;
  /** Three bytes per face: this world is flat-shaded, one colour a triangle. */
  readonly faceColour: Uint8ClampedArray;
  /** The radius the water reaches. Everything below it was pushed up to it. */
  readonly seaRadius: number;
}

/** A filter takes a world and returns the world that follows it. */
export type Filter = (world: World) => World;

export function emptyWorld(seed: number): World {
  const mesh = icosahedron();
  return {
    seed,
    mesh,
    temperature: new Float32Array(mesh.vertexCount),
    faceColour: new Uint8ClampedArray(mesh.faceCount * 3),
    seaRadius: 0,
  };
}

/** A world whose mesh has been replaced, with the fields sized to match. */
export function withMesh(world: World, mesh: Mesh): World {
  return {
    ...world,
    mesh,
    temperature: new Float32Array(mesh.vertexCount),
    faceColour: new Uint8ClampedArray(mesh.faceCount * 3),
  };
}

/** How far north or south a vertex is: 0 at the equator, 1 at the poles. */
export function latitudeOfVertex(world: World, vertex: number): number {
  return Math.abs(world.mesh.directions[vertex * 3 + 1] ?? 0);
}

/** The mean of a per-vertex field over the three corners of a face. */
export function acrossFace(world: World, field: Float32Array, face: number): number {
  const a = world.mesh.faces[face * 3] ?? 0;
  const b = world.mesh.faces[face * 3 + 1] ?? 0;
  const c = world.mesh.faces[face * 3 + 2] ?? 0;
  return ((field[a] ?? 0) + (field[b] ?? 0) + (field[c] ?? 0)) / 3;
}

/** The mean radius of the three corners of a face. */
export function radiusOfFace(world: World, face: number): number {
  return acrossFace(world, world.mesh.radii, face);
}
