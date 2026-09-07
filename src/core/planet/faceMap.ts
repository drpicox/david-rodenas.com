import type { Mesh } from "./icosphere";

const BUCKETS_X = 48;
const BUCKETS_Y = 24;

/** Which faces are worth testing for a direction, without testing all of them. */
function bucketsOf(mesh: Mesh): number[][] {
  const buckets: number[][] = Array.from({ length: BUCKETS_X * BUCKETS_Y }, () => []);

  for (let face = 0; face < mesh.faceCount; face += 1) {
    const x = mesh.centroids[face * 3]!;
    const y = mesh.centroids[face * 3 + 1]!;
    const z = mesh.centroids[face * 3 + 2]!;
    const column = Math.floor(((Math.atan2(z, x) / (Math.PI * 2) + 0.5) % 1) * BUCKETS_X);
    const row = Math.floor((Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI + 0.5) * BUCKETS_Y);

    // A face is filed under its own bucket and the ring around it, so a
    // direction near an edge still finds the face it belongs to.
    for (let dr = -1; dr <= 1; dr += 1) {
      const r = row + dr;
      if (r < 0 || r >= BUCKETS_Y) continue;
      for (let dc = -1; dc <= 1; dc += 1) {
        const c = (column + dc + BUCKETS_X) % BUCKETS_X;
        buckets[r * BUCKETS_X + c]!.push(face);
      }
    }
  }

  return buckets;
}

/** How far outside its triangle a direction falls; negative means inside. */
function distanceOutside(mesh: Mesh, face: number, dx: number, dy: number, dz: number): number {
  let worst = -Infinity;

  for (let edge = 0; edge < 3; edge += 1) {
    const a = mesh.faces[face * 3 + edge]!;
    const b = mesh.faces[face * 3 + ((edge + 1) % 3)]!;
    const ax = mesh.vertices[a * 3]!;
    const ay = mesh.vertices[a * 3 + 1]!;
    const az = mesh.vertices[a * 3 + 2]!;
    const bx = mesh.vertices[b * 3]!;
    const by = mesh.vertices[b * 3 + 1]!;
    const bz = mesh.vertices[b * 3 + 2]!;

    // The plane through the origin and the edge: inside is the negative side.
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    worst = Math.max(worst, -(dx * nx + dy * ny + dz * nz));
  }

  return worst;
}

/**
 * For every cell of an equirectangular map, the face of the solid that covers
 * it. It depends only on how many times the icosahedron was subdivided, never
 * on the seed, so one map serves every world ever grown at that level.
 */
export function buildFaceMap(mesh: Mesh, width: number, height: number): Uint32Array {
  const map = new Uint32Array(width * height);
  const buckets = bucketsOf(mesh);

  for (let y = 0; y < height; y += 1) {
    const latitude = ((y + 0.5) / height - 0.5) * Math.PI;
    const ring = Math.cos(latitude);
    const dy = Math.sin(latitude);
    const row = Math.min(BUCKETS_Y - 1, Math.floor(((y + 0.5) / height) * BUCKETS_Y));

    for (let x = 0; x < width; x += 1) {
      const longitude = ((x + 0.5) / width) * Math.PI * 2 - Math.PI;
      const dx = ring * Math.cos(longitude);
      const dz = ring * Math.sin(longitude);
      const column = Math.min(BUCKETS_X - 1, Math.floor(((x + 0.5) / width) * BUCKETS_X));

      const candidates = buckets[row * BUCKETS_X + column]!;
      let best = 0;
      let bestDistance = Infinity;
      for (const face of candidates) {
        const distance = distanceOutside(mesh, face, dx, dy, dz);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = face;
          if (distance <= 0) break;
        }
      }

      // Near a pole the map crowds hundreds of cells into almost the same
      // direction, and the buckets stop agreeing with each other; the result
      // is a fan of slivers around the axis. When no candidate actually
      // contained the direction, look at all of them — it is rare, and it is
      // the difference between a planet and a planet with a scar on it.
      if (bestDistance > 0) {
        for (let face = 0; face < mesh.faceCount; face += 1) {
          const distance = distanceOutside(mesh, face, dx, dy, dz);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = face;
            if (distance <= 0) break;
          }
        }
      }

      map[y * width + x] = best;
    }
  }

  return map;
}
