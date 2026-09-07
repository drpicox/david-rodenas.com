import { buildFaceMap } from "./faceMap";
import { buildIcosphere, type Mesh } from "./icosphere";

/**
 * A world is a subdivided icosahedron plus everything the filters have decided
 * about it so far. Height and warmth belong to the corners; colour belongs to
 * the faces, which is what makes the finished planet faceted rather than
 * smooth — you can count the triangles, and that is the point.
 */
export interface World {
  readonly seed: number;
  readonly subdivisions: number;
  readonly mesh: Mesh;
  /** Per vertex, roughly -1..1. */
  readonly elevation: Float32Array;
  /** Per vertex, 0 at the coldest pole and 1 at the warmest equator. */
  readonly temperature: Float32Array;
  /** Three bytes per face. Empty until something paints it. */
  readonly faceColour: Uint8ClampedArray;
  readonly seaLevel: number;
}

/** A filter takes a world and returns the world that follows it. */
export type Filter = (world: World) => World;

export const MAP_WIDTH = 512;
export const MAP_HEIGHT = 256;

const meshes = new Map<number, Mesh>();
const faceMaps = new Map<number, Uint32Array>();

/** The solid at a given level, built once and shared by every world. */
export function icosphereOf(subdivisions: number): Mesh {
  const known = meshes.get(subdivisions);
  if (known) return known;
  const mesh = buildIcosphere(subdivisions);
  meshes.set(subdivisions, mesh);
  return mesh;
}

/**
 * Which face covers each cell of an equirectangular map. It depends only on
 * the level, never on the seed, so it is computed once and every world after
 * that is free.
 */
export function faceMapOf(subdivisions: number): Uint32Array {
  const known = faceMaps.get(subdivisions);
  if (known) return known;
  const map = buildFaceMap(icosphereOf(subdivisions), MAP_WIDTH, MAP_HEIGHT);
  faceMaps.set(subdivisions, map);
  return map;
}

export function emptyWorld(seed: number, subdivisions: number): World {
  const mesh = icosphereOf(subdivisions);
  return {
    seed,
    subdivisions,
    mesh,
    elevation: new Float32Array(mesh.vertexCount),
    temperature: new Float32Array(mesh.vertexCount),
    faceColour: new Uint8ClampedArray(mesh.faceCount * 3),
    seaLevel: 0,
  };
}

/** The direction of a vertex, which for a unit sphere is the vertex itself. */
export function vertexAt(world: World, vertex: number): [number, number, number] {
  return [
    world.mesh.vertices[vertex * 3] ?? 0,
    world.mesh.vertices[vertex * 3 + 1] ?? 0,
    world.mesh.vertices[vertex * 3 + 2] ?? 0,
  ];
}

/** How far north or south a vertex is: 0 at the equator, 1 at the poles. */
export function latitudeOfVertex(world: World, vertex: number): number {
  return Math.abs(world.mesh.vertices[vertex * 3 + 1] ?? 0);
}

/** The mean of a per-vertex field over the three corners of a face. */
export function acrossFace(world: World, field: Float32Array, face: number): number {
  const a = world.mesh.faces[face * 3] ?? 0;
  const b = world.mesh.faces[face * 3 + 1] ?? 0;
  const c = world.mesh.faces[face * 3 + 2] ?? 0;
  return ((field[a] ?? 0) + (field[b] ?? 0) + (field[c] ?? 0)) / 3;
}
