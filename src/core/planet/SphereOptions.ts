/** Where the world is turned to, how it is tipped, and where its sun is. */
export interface SphereOptions {
  /** Radians turned about the axis. One full turn is 2π. */
  readonly rotation: number;
  /** Axial tilt, so the poles are visible and the thing reads as a globe. */
  readonly tilt?: number;
  /** Where the sun is, in view space. */
  readonly light?: readonly [number, number, number];
}
