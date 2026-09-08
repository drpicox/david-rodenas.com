import type { Turning } from "../../world/turning";

/** How far the stars slide for one full turn of a world, or one full turn of tilt. */
const PIXELS_PER_TURN = 900;
/** Left to itself the sky drifts, much slower than any world. */
const DRIFT_SECONDS = 480;
/** The near layer's tile; the sky is kept within one so the numbers never grow. */
const TILE = { x: 1600, y: 1000 };

function wrap(value: number, tile: number): number {
  return ((value % tile) + tile) % tile;
}

/**
 * The two layers of stars, when something on the page is moving them.
 *
 * Left alone they drift by a CSS animation the compositor runs on its own, and
 * this does nothing at all. The first time a world says it turned, this takes
 * over — reading where the animation had got to, so the takeover does not
 * show — and from then on the stars go with the hand.
 */
export class Starfield {
  private x = 0;
  private y = 0;
  private written = "";
  private driving = false;

  /** A world turned. Slide the stars with it, and drift them a little besides. */
  follow({ byRadians, tiltedBy, seconds }: Turning): void {
    const root = document.documentElement;
    if (root.dataset["sky"] !== "stars") return;
    if (!this.driving) this.takeOver(root);

    const perRadian = PIXELS_PER_TURN / (Math.PI * 2);
    const drifted = ((seconds / DRIFT_SECONDS) * Math.PI * 2 + byRadians) * perRadian;
    this.x = wrap(this.x + drifted, TILE.x);
    this.y = wrap(this.y - tiltedBy * perRadian, TILE.y);

    // Only touched when it would move by half a pixel, so a slow drift is not a write a frame.
    const wanted = `${(Math.round(this.x * 2) / 2).toFixed(1)}px ${(Math.round(this.y * 2) / 2).toFixed(1)}px`;
    if (wanted === this.written) return;
    this.written = wanted;
    const [x, y] = wanted.split(" ");
    root.style.setProperty("--sky-x", x ?? "0px");
    root.style.setProperty("--sky-y", y ?? "0px");
  }

  /** Hand the stars back to their own drift. */
  release(): void {
    const root = document.documentElement;
    root.classList.remove("sky-driven");
    root.style.removeProperty("--sky-x");
    root.style.removeProperty("--sky-y");
    this.x = 0;
    this.y = 0;
    this.written = "";
    this.driving = false;
  }

  /** Start where the drift had got to, so nothing jumps at the moment of the first touch. */
  private takeOver(root: HTMLElement): void {
    const drifted = getComputedStyle(document.body, "::before").transform;
    if (drifted && drifted !== "none") {
      try {
        const matrix = new DOMMatrixReadOnly(drifted);
        this.x = wrap(matrix.m41, TILE.x);
        this.y = wrap(matrix.m42, TILE.y);
      } catch {
        // An unreadable transform only means starting from nought.
      }
    }
    root.classList.add("sky-driven");
    this.driving = true;
  }
}
