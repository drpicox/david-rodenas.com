import type { SphereOptions } from "./SphereOptions";
import type { World } from "./World";

const AMBIENT = 0.3;
const DEFAULT_LIGHT = [-0.5, 0.45, 0.74] as const;
const MARGIN = 1.02;

/**
 * Paints worlds onto a square RGBA buffer, over and over, without asking for
 * memory again.
 *
 * The planet is no longer a ball with a picture on it — the corners sit at
 * different distances from the centre — so this is a real rasteriser: it
 * transforms the corners, drops the faces pointing away, and fills the rest
 * with a depth buffer. That is what lets a mountain break the silhouette
 * instead of only changing colour.
 *
 * Flat shading is a choice, not a shortcut: one normal per triangle is what
 * makes the solid readable as a solid.
 *
 * It is a thing rather than a function because of what a turning world costs.
 * A frame at 360 pixels needs half a megabyte of pixels and half a megabyte of
 * depth, and a fresh pair sixty times a second is thirty megabytes a second
 * for the collector to sweep up — which it does in pauses you can see. So the
 * buffers are made once and cleared instead, no corner is a fresh array, and
 * whoever owns the canvas can hand over its own pixels so that even the copy
 * out is gone.
 */
export class SphereRaster {
  readonly size: number;
  private readonly pixels: Uint8ClampedArray;
  private readonly depth: Float32Array;
  /** The corners, turned. Grown to fit a mesh, never shrunk, because a dial only moves so far. */
  private view = new Float32Array(0);
  private screen = new Float32Array(0);

  constructor(size: number, pixels: Uint8ClampedArray = new Uint8ClampedArray(size * size * 4)) {
    if (pixels.length !== size * size * 4) {
      throw new Error(`SphereRaster: ${size}×${size} needs ${size * size * 4} bytes, not ${pixels.length}`);
    }
    this.size = size;
    this.pixels = pixels;
    this.depth = new Float32Array(size * size);
  }

  /** The picture. Always the same buffer: read it, or copy it, before the next call. */
  paint(world: World, options: SphereOptions): Uint8ClampedArray {
    const { size, pixels, depth } = this;
    pixels.fill(0);
    depth.fill(-Infinity);

    const [lx, ly, lz] = normalised(options.light ?? DEFAULT_LIGHT);

    const tilt = options.tilt ?? -0.38;
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    const cosSpin = Math.cos(options.rotation);
    const sinSpin = Math.sin(options.rotation);

    const { directions, radii, faces, faceCount, vertexCount } = world.mesh;

    let highest = 1;
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const radius = radii[vertex] ?? 1;
      if (radius > highest) highest = radius;
    }
    const scale = size / (2 * highest * MARGIN);

    if (this.view.length < vertexCount * 3) {
      this.view = new Float32Array(vertexCount * 3);
      this.screen = new Float32Array(vertexCount * 3);
    }
    const view = this.view;
    const screen = this.screen;

    // Spin about the axis, then tip the axis towards the viewer. The result is
    // kept in view space — y still up, z still towards the viewer — because the
    // lighting has to be worked out there, not in screen space where y is
    // flipped and the scale has already been applied.
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const radius = radii[vertex] ?? 1;
      const x = (directions[vertex * 3] ?? 0) * radius;
      const y = (directions[vertex * 3 + 1] ?? 0) * radius;
      const z = (directions[vertex * 3 + 2] ?? 0) * radius;
      const sx = x * cosSpin - z * sinSpin;
      const sz = x * sinSpin + z * cosSpin;
      const ty = y * cosTilt + sz * sinTilt;
      const tz = -y * sinTilt + sz * cosTilt;
      view[vertex * 3] = sx;
      view[vertex * 3 + 1] = ty;
      view[vertex * 3 + 2] = tz;
      screen[vertex * 3] = size / 2 + sx * scale;
      screen[vertex * 3 + 1] = size / 2 - ty * scale;
      screen[vertex * 3 + 2] = tz;
    }

    for (let face = 0; face < faceCount; face += 1) {
      const a = faces[face * 3] ?? 0;
      const b = faces[face * 3 + 1] ?? 0;
      const c = faces[face * 3 + 2] ?? 0;

      const ax = screen[a * 3]!;
      const ay = screen[a * 3 + 1]!;
      const az = screen[a * 3 + 2]!;
      const bx = screen[b * 3]!;
      const by = screen[b * 3 + 1]!;
      const bz = screen[b * 3 + 2]!;
      const cx = screen[c * 3]!;
      const cy = screen[c * 3 + 1]!;
      const cz = screen[c * 3 + 2]!;

      // Screen y grows downwards, so a front face winds the other way here.
      const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      if (area >= 0) continue;

      const vax = view[a * 3]!;
      const vay = view[a * 3 + 1]!;
      const vaz = view[a * 3 + 2]!;
      const ux = view[b * 3]! - vax;
      const uy = view[b * 3 + 1]! - vay;
      const uz = view[b * 3 + 2]! - vaz;
      const wx = view[c * 3]! - vax;
      const wy = view[c * 3 + 1]! - vay;
      const wz = view[c * 3 + 2]! - vaz;

      const rawX = uy * wz - uz * wy;
      const rawY = uz * wx - ux * wz;
      const rawZ = ux * wy - uy * wx;
      const length = Math.hypot(rawX, rawY, rawZ) || 1;
      const facing = (rawX / length) * lx + (rawY / length) * ly + (rawZ / length) * lz;
      const light = AMBIENT + (1 - AMBIENT) * Math.max(0, facing);

      const red = (world.faceColour[face * 3] ?? 0) * light;
      const green = (world.faceColour[face * 3 + 1] ?? 0) * light;
      const blue = (world.faceColour[face * 3 + 2] ?? 0) * light;

      const left = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
      const right = Math.min(size - 1, Math.ceil(Math.max(ax, bx, cx)));
      const top = Math.max(0, Math.floor(Math.min(ay, by, cy)));
      const bottom = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy)));

      for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) {
          const px = x + 0.5;
          const py = y + 0.5;
          const w0 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
          const w1 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
          const w2 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
          if (w0 > 0 || w1 > 0 || w2 > 0) continue;

          // Barycentric weights, to interpolate depth across the triangle.
          const alpha = w1 / area;
          const beta = w2 / area;
          const z = az * alpha + bz * beta + cz * (1 - alpha - beta);

          const at = y * size + x;
          if (z <= depth[at]!) continue;
          depth[at] = z;

          pixels[at * 4] = red;
          pixels[at * 4 + 1] = green;
          pixels[at * 4 + 2] = blue;
          pixels[at * 4 + 3] = 255;
        }
      }
    }

    return pixels;
  }
}

function normalised([x, y, z]: readonly [number, number, number]): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}
