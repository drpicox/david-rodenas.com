import { faceMapOf, MAP_HEIGHT, MAP_WIDTH, type World } from "./World";

export interface SphereOptions {
  /** Radians turned about the axis. One full turn is 2π. */
  readonly rotation: number;
  /** Axial tilt, so the poles are visible and the thing reads as a globe. */
  readonly tilt?: number;
  /** Where the sun is, in view space. */
  readonly light?: readonly [number, number, number];
}

const AMBIENT = 0.3;
const DEFAULT_LIGHT = [-0.55, 0.42, 0.72] as const;

function normalise([x, y, z]: readonly [number, number, number]): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/**
 * Paints the world onto a square RGBA buffer, seen from the front.
 *
 * There is no 3D library here and there does not need to be one: a sphere seen
 * head-on is a circle whose surface normal is the point itself, which makes
 * both the projection and the shading two lines of arithmetic. Finding which
 * triangle a pixel belongs to is a lookup in a map that depends only on how
 * many times the solid was subdivided, so it is computed once and reused by
 * every world.
 */
export function renderSphere(world: World, size: number, options: SphereOptions): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const faceMap = faceMapOf(world.subdivisions);
  const [lx, ly, lz] = normalise(options.light ?? DEFAULT_LIGHT);
  const tilt = options.tilt ?? -0.38;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const cosSpin = Math.cos(options.rotation);
  const sinSpin = Math.sin(options.rotation);

  for (let py = 0; py < size; py += 1) {
    const ny = 1 - ((py + 0.5) / size) * 2;
    for (let px = 0; px < size; px += 1) {
      const nx = ((px + 0.5) / size) * 2 - 1;
      const radius = nx * nx + ny * ny;
      const at = (py * size + px) * 4;
      if (radius > 1) continue;

      const nz = Math.sqrt(1 - radius);

      // Undo the tilt, then the spin, to find which point of the solid is here.
      const ty = ny * cosTilt - nz * sinTilt;
      const tz = ny * sinTilt + nz * cosTilt;
      const wx = nx * cosSpin + tz * sinSpin;
      const wz = -nx * sinSpin + tz * cosSpin;

      const latitude = Math.asin(Math.max(-1, Math.min(1, ty)));
      const longitude = Math.atan2(wz, wx);
      const u = Math.min(MAP_WIDTH - 1, Math.max(0, Math.floor(((longitude / (Math.PI * 2) + 0.5) % 1) * MAP_WIDTH)));
      const v = Math.min(MAP_HEIGHT - 1, Math.max(0, Math.floor((latitude / Math.PI + 0.5) * MAP_HEIGHT)));
      const face = faceMap[v * MAP_WIDTH + u] ?? 0;

      const diffuse = Math.max(0, nx * lx + ny * ly + nz * lz);
      const light = AMBIENT + (1 - AMBIENT) * diffuse;
      // A soft edge, so the disc does not end in a staircase.
      const alpha = Math.min(1, (1 - Math.sqrt(radius)) * size * 0.5) * 255;

      pixels[at] = (world.faceColour[face * 3] ?? 0) * light;
      pixels[at + 1] = (world.faceColour[face * 3 + 1] ?? 0) * light;
      pixels[at + 2] = (world.faceColour[face * 3 + 2] ?? 0) * light;
      pixels[at + 3] = alpha;
    }
  }

  return pixels;
}
