/** A turn the stars can follow: this far about the axis, this far in tilt, over this long. */
export interface Turn {
  /** Radians turned, rightwards positive. */
  readonly byRadians: number;
  /** Radians tipped. */
  readonly tiltedBy: number;
  /** How long that took, so the stars can drift at their own pace besides. */
  readonly seconds: number;
}

/**
 * Whatever says it turned, and lets the stars listen. The sky does not know
 * what turns, and does not need to: the composition hands it over, and the
 * compiler checks there that what it hands is this.
 */
export interface Turns {
  on(listener: (turn: Turn) => void): () => void;
}
