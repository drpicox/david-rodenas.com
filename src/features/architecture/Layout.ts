/** A box of the picture: a folder of the frame, or a feature. */
export interface BoxPlace {
  readonly name: string;
  /** The name it is labelled with: the last word of it. */
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** The row it stands in, counted from the bottom: a box stands above everything it needs. */
  readonly rank: number;
  /** Caught in a circle with other boxes, which no order of rows can put right. */
  readonly cyclic: boolean;
}

/** A file: a ball in its box, as big as it is long. */
export interface BallPlace {
  readonly id: number;
  readonly path: string;
  readonly box: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly test: boolean;
  /** Nothing in it runs, so nothing in it can be tested. */
  readonly typesOnly: boolean;
}

/** All the arrows from one box to another, drawn as one, as thick as there are many. */
export interface BoxLink {
  readonly from: string;
  readonly to: string;
  readonly count: number;
  /** Every arrow in it needs only a type: the box depends on an interface, not on what implements it. */
  readonly typeOnly: boolean;
}

/**
 * Where a link leaves the bottom of its box and reaches the top of the other.
 * The ends are spread along each edge in the order of what is at the other
 * end, so arrows fan out and in instead of all meeting at one point.
 */
export interface LinkPlace extends BoxLink {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** The box around the boxes of one level: the frame, the features, the composition root. */
export interface BandPlace {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Where everything stands in one snapshot. */
export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly bands: readonly BandPlace[];
  readonly boxes: readonly BoxPlace[];
  readonly balls: readonly BallPlace[];
  readonly links: readonly LinkPlace[];
}
