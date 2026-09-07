import { positionOf } from "./icosphere";
import type { World } from "./World";

export interface SphereOptions {
  /** Radians turned about the axis. One full turn is 2π. */
  readonly rotation: number;
  /** Axial tilt, so the poles are visible and the thing reads as a globe. */
  readonly tilt?: number;
  /** Where the sun is, in view space. */
  readonly light?: readonly [number, number, number];
}

const AMBIENT = 0.3;
const DEFAULT_LIGHT = [-0.5, 0.45, 0.74] as const;
const MARGIN = 1.02;

function normalise([x, y, z]: readonly [number, number, number]): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/**
 * Paints the world onto a square RGBA buffer.
 *
 * The planet is no longer a ball with a picture on it — the corners sit at
 * different distances from the centre — so this is a real rasteriser: it
 * transforms the corners, drops the faces pointing away, and fills the rest
 * with a depth buffer. That is what lets a mountain break the silhouette
 * instead of only changing colour.
 *
 * Flat shading is a choice, not a shortcut: one normal per triangle is what
 * makes the solid readable as a solid.
 */
export function renderSphere(world: World, size: number, options: SphereOptions): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const depth = new Float32Array(size * size).fill(-Infinity);
  const [lx, ly, lz] = normalise(options.light ?? DEFAULT_LIGHT);

  const tilt = options.tilt ?? -0.38;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const cosSpin = Math.cos(options.rotation);
  const sinSpin = Math.sin(options.rotation);

  const highest = world.mesh.radii.reduce((high, radius) => Math.max(high, radius), 1);
  const scale = size / (2 * highest * MARGIN);

  // Spin about the axis, then tip the axis towards the viewer. The result is
  // kept in view space — y still up, z still towards the viewer — because the
  // lighting has to be worked out there, not in screen space where y is
  // flipped and the scale has already been applied.
  const view = new Float32Array(world.mesh.vertexCount * 3);
  const screen = new Float32Array(world.mesh.vertexCount * 3);
  for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
    const [x, y, z] = positionOf(world.mesh, vertex);
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

  for (let face = 0; face < world.mesh.faceCount; face += 1) {
    const a = world.mesh.faces[face * 3] ?? 0;
    const b = world.mesh.faces[face * 3 + 1] ?? 0;
    const c = world.mesh.faces[face * 3 + 2] ?? 0;

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

    const [nx, ny, nz] = normalise([uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx]);
    const light = AMBIENT + (1 - AMBIENT) * Math.max(0, nx * lx + ny * ly + nz * lz);

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
