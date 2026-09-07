/** Everything that decides a world: the seed and the three dials of the pipeline. */
export interface WorldRecipe {
  readonly seed: number;
  /** How many times every edge is split. Triangles: 20 × 4^levels. */
  readonly levels: number;
  /** How far a new midpoint may move, as a fraction of its edge. */
  readonly roughness: number;
  /** The share of the surface under water. */
  readonly share: number;
}

/** The world the header grows, seed aside. */
export const HEADER_RECIPE: Omit<WorldRecipe, "seed"> = { levels: 4, roughness: 0.28, share: 0.55 };
