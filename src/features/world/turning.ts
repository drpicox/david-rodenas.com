import { Signal } from "../../platform/plugin/Signal";

/** A world moved: this far about its axis, this far in tilt, over this long. */
export interface Turning {
  /** Radians the hand turned it, rightwards positive. A world turning by itself announces zero. */
  readonly byRadians: number;
  /** Radians the hand tipped it. */
  readonly tiltedBy: number;
  /** How long that took, so whoever follows can work at its own pace. */
  readonly seconds: number;
}

/**
 * Announced by any world on the page, every frame it is being drawn.
 *
 * The world does not know that anything is listening, and does not care. The
 * sky is; that is the sky's business, and it is the only reason this exists.
 */
export const turning = new Signal<Turning>();
