import { describe, expect, it } from "vitest";
import { buildFaceMap } from "./faceMap";
import { buildIcosphere } from "./icosphere";

describe("buildIcosphere", () => {
  it("starts as the solid itself", () => {
    const solid = buildIcosphere(0);
    expect(solid.faceCount).toBe(20);
    expect(solid.vertexCount).toBe(12);
  });

  it("quarters every face at each level", () => {
    expect(buildIcosphere(1).faceCount).toBe(80);
    expect(buildIcosphere(2).faceCount).toBe(320);
    expect(buildIcosphere(3).faceCount).toBe(1280);
  });

  it("shares the corners it splits instead of duplicating them", () => {
    // Euler: a closed triangulation has V - E + F = 2, and E = 3F / 2.
    const mesh = buildIcosphere(2);
    expect(mesh.vertexCount - (3 * mesh.faceCount) / 2 + mesh.faceCount).toBe(2);
  });

  it("keeps every corner and every centroid on the unit sphere", () => {
    const mesh = buildIcosphere(2);
    for (let vertex = 0; vertex < mesh.vertexCount; vertex += 1) {
      const at = vertex * 3;
      expect(Math.hypot(mesh.vertices[at]!, mesh.vertices[at + 1]!, mesh.vertices[at + 2]!)).toBeCloseTo(1, 5);
    }
    for (let face = 0; face < mesh.faceCount; face += 1) {
      const at = face * 3;
      expect(Math.hypot(mesh.centroids[at]!, mesh.centroids[at + 1]!, mesh.centroids[at + 2]!)).toBeCloseTo(1, 5);
    }
  });
});

describe("buildFaceMap", () => {
  const mesh = buildIcosphere(2);
  const width = 128;
  const height = 64;
  const map = buildFaceMap(mesh, width, height);

  /** Positive means the direction fell outside that triangle. */
  function distanceOutside(face: number, dx: number, dy: number, dz: number): number {
    let worst = -Infinity;
    for (let edge = 0; edge < 3; edge += 1) {
      const a = mesh.faces[face * 3 + edge]!;
      const b = mesh.faces[face * 3 + ((edge + 1) % 3)]!;
      const [ax, ay, az] = [mesh.vertices[a * 3]!, mesh.vertices[a * 3 + 1]!, mesh.vertices[a * 3 + 2]!];
      const [bx, by, bz] = [mesh.vertices[b * 3]!, mesh.vertices[b * 3 + 1]!, mesh.vertices[b * 3 + 2]!];
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      worst = Math.max(worst, -(dx * nx + dy * ny + dz * nz));
    }
    return worst;
  }

  it("names a real face for every cell", () => {
    expect(map).toHaveLength(width * height);
    expect(Math.max(...map)).toBeLessThan(mesh.faceCount);
  });

  it("names the face that actually covers the cell, poles included", () => {
    // The bucketed search used to give up near the axis and leave a fan of
    // slivers around the pole. Every cell must land inside its own triangle.
    let outside = 0;
    for (let y = 0; y < height; y += 1) {
      const latitude = ((y + 0.5) / height - 0.5) * Math.PI;
      const ring = Math.cos(latitude);
      const dy = Math.sin(latitude);
      for (let x = 0; x < width; x += 1) {
        const longitude = ((x + 0.5) / width) * Math.PI * 2 - Math.PI;
        const face = map[y * width + x]!;
        if (distanceOutside(face, ring * Math.cos(longitude), dy, ring * Math.sin(longitude)) > 1e-6) outside += 1;
      }
    }
    expect(outside).toBe(0);
  });

  it("uses every face of the solid somewhere", () => {
    expect(new Set(map).size).toBe(mesh.faceCount);
  });
});
