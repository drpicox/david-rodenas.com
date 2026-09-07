/**
 * A world is an equirectangular map of a sphere plus everything the filters
 * have decided about it so far. Filters read the fields before them and write
 * the ones after: that is what makes the order of the pipeline meaningful.
 */
export interface World {
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  /** Metres above or below the mean radius, normalised to -1..1. */
  readonly elevation: Float32Array;
  /** 0 at the coldest pole, 1 at the warmest point of the equator. */
  readonly temperature: Float32Array;
  /** Three bytes per cell. Empty until something colours it. */
  readonly colour: Uint8ClampedArray;
  readonly seaLevel: number;
}

/** A filter takes a world and returns the world that follows it. */
export type Filter = (world: World) => World;

export function emptyWorld(seed: number, width: number, height: number): World {
  return {
    seed,
    width,
    height,
    elevation: new Float32Array(width * height),
    temperature: new Float32Array(width * height),
    colour: new Uint8ClampedArray(width * height * 3),
    seaLevel: 0,
  };
}

/** The direction in space of a cell of the map, which is where noise is read. */
export function directionOf(world: World, x: number, y: number): [number, number, number] {
  const longitude = ((x + 0.5) / world.width) * Math.PI * 2;
  const latitude = ((y + 0.5) / world.height - 0.5) * Math.PI;
  const ring = Math.cos(latitude);
  return [ring * Math.cos(longitude), Math.sin(latitude), ring * Math.sin(longitude)];
}

/** How far north or south a row is, 0 at the equator and 1 at the poles. */
export function latitudeOf(world: World, y: number): number {
  return Math.abs((y + 0.5) / world.height - 0.5) * 2;
}
