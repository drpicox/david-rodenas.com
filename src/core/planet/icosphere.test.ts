import { describe, expect, it } from "vitest";
import { icosahedron, positionOf, subdivide, type Mesh } from "./icosphere";

const flat = () => 0;

function radiusOf(mesh: Mesh, vertex: number): number {
  return mesh.radii[vertex] ?? 0;
}

describe("icosahedron", () => {
  const solid = icosahedron();

  it("is the twenty-faced solid", () => {
    expect(solid.faceCount).toBe(20);
    expect(solid.vertexCount).toBe(12);
  });

  it("starts perfectly round", () => {
    expect([...solid.radii].every((radius) => radius === 1)).toBe(true);
  });

  it("points every corner outwards by exactly one", () => {
    for (let vertex = 0; vertex < solid.vertexCount; vertex += 1) {
      const [x, y, z] = positionOf(solid, vertex);
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6);
    }
  });
});

describe("subdivide", () => {
  it("quarters every face", () => {
    expect(subdivide(icosahedron(), flat).faceCount).toBe(80);
    expect(subdivide(subdivide(icosahedron(), flat), flat).faceCount).toBe(320);
  });

  it("shares the corners it splits instead of duplicating them", () => {
    // Euler: a closed triangulation has V - E + F = 2, and E = 3F / 2.
    const mesh = subdivide(subdivide(icosahedron(), flat), flat);
    expect(mesh.vertexCount - (3 * mesh.faceCount) / 2 + mesh.faceCount).toBe(2);
  });

  it("leaves the corners that already existed exactly where they were", () => {
    const solid = icosahedron();
    const split = subdivide(solid, () => 0.5);
    for (let vertex = 0; vertex < solid.vertexCount; vertex += 1) {
      expect(radiusOf(split, vertex)).toBe(radiusOf(solid, vertex));
    }
  });

  it("moves only the new midpoints", () => {
    const solid = icosahedron();
    const split = subdivide(solid, () => 0.5);
    for (let vertex = solid.vertexCount; vertex < split.vertexCount; vertex += 1) {
      expect(radiusOf(split, vertex)).toBeCloseTo(1.5, 6);
    }
  });

  it("hands the displacement the length of the edge it is splitting", () => {
    const lengths: number[] = [];
    subdivide(icosahedron(), (length) => {
      lengths.push(length);
      return 0;
    });
    // Every edge of a unit icosahedron is the same length.
    const first = lengths[0]!;
    expect(lengths).toHaveLength(30);
    expect(lengths.every((length) => Math.abs(length - first) < 1e-6)).toBe(true);
    expect(first).toBeCloseTo(1.0514622, 5);
  });

  it("halves the edges it works on at every level, which is what makes it fractal", () => {
    const longest = (mesh: Mesh): number => {
      let worst = 0;
      for (let face = 0; face < mesh.faceCount; face += 1) {
        for (let edge = 0; edge < 3; edge += 1) {
          const a = mesh.faces[face * 3 + edge]!;
          const b = mesh.faces[face * 3 + ((edge + 1) % 3)]!;
          const [ax, ay, az] = positionOf(mesh, a);
          const [bx, by, bz] = positionOf(mesh, b);
          worst = Math.max(worst, Math.hypot(ax - bx, ay - by, az - bz));
        }
      }
      return worst;
    };

    const once = subdivide(icosahedron(), flat);
    const twice = subdivide(once, flat);
    expect(longest(twice)).toBeLessThan(longest(once) * 0.6);
  });
});
