import type { Mesh } from "./Mesh";

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
