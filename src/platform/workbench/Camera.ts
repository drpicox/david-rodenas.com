/** A rectangle, in whichever units it is said in. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const LEAST = 0.25;
const MOST = 2;

/**
 * Where the canvas looks: how far it is moved, and how near. A point on the
 * screen is a point of the blueprint once the move is taken off and the
 * nearness divided out; zooming keeps the point under the pointer where it
 * is, as every map does.
 */
export class Camera {
  constructor(
    public x = 0,
    public y = 0,
    public zoom = 1,
  ) {}

  /** A point of the canvas element, in pixels, as a point of the blueprint. */
  toWorld(px: number, py: number): { x: number; y: number } {
    return { x: (px - this.x) / this.zoom, y: (py - this.y) / this.zoom };
  }

  /** Nearer or further by a factor, keeping the point under the pointer where it is, and never nearer or further than can be read. */
  zoomAt(px: number, py: number, factor: number): void {
    const zoom = Math.min(MOST, Math.max(LEAST, this.zoom * factor));
    const world = this.toWorld(px, py);
    this.zoom = zoom;
    this.x = px - world.x * zoom;
    this.y = py - world.y * zoom;
  }

  /** Looking at all of something, centred, with a margin, never nearer than as it is. */
  fit(bounds: Box, view: { readonly width: number; readonly height: number }, margin = 32): void {
    if (bounds.width <= 0 || view.width <= 0 || view.height <= 0) return;
    this.zoom = Math.min(1, Math.max(LEAST, Math.min((view.width - margin * 2) / bounds.width, (view.height - margin * 2) / bounds.height)));
    this.x = (view.width - bounds.width * this.zoom) / 2 - bounds.x * this.zoom;
    this.y = (view.height - bounds.height * this.zoom) / 2 - bounds.y * this.zoom;
  }
}
