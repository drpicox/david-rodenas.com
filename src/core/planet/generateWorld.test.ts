import { describe, expect, it } from "vitest";
import { colourise, fractalise, sea, temperatures } from "./filters";
import { generateWorld, PIPELINE } from "./generateWorld";
import { acrossFace, latitudeOfVertex, type World } from "./World";

/** Mean warmth of the corners whose latitude falls in a band. */
function averageTemperatureNear(world: World, latitude: number): number {
  let total = 0;
  let counted = 0;
  for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
    if (Math.abs(latitudeOfVertex(world, vertex) - latitude) > 0.12) continue;
    total += world.temperature[vertex] ?? 0;
    counted += 1;
  }
  return counted === 0 ? 0 : total / counted;
}

function isPainted(world: World): boolean {
  return world.faceColour.some((channel) => channel !== 0);
}

/** How much the painting says: one colour is a world nobody can read. */
function coloursIn(world: World): number {
  const seen = new Set<number>();
  for (let index = 0; index < world.faceColour.length; index += 3) {
    seen.add(
      ((world.faceColour[index] ?? 0) << 16) |
        ((world.faceColour[index + 1] ?? 0) << 8) |
        (world.faceColour[index + 2] ?? 0),
    );
  }
  return seen.size;
}

describe("generateWorld", () => {
  it("grows the same world from the same seed", () => {
    expect(Array.from(generateWorld(7).elevation)).toEqual(Array.from(generateWorld(7).elevation));
  });

  it("grows a different world from a different seed", () => {
    expect(Array.from(generateWorld(7).elevation)).not.toEqual(Array.from(generateWorld(8).elevation));
  });

  it("is made of triangles you can count", () => {
    const world = generateWorld(3);
    expect(world.mesh.faceCount).toBe(20 * 4 ** world.subdivisions);
    expect(world.faceColour.length).toBe(world.mesh.faceCount * 3);
  });

  it("keeps every corner on the surface of the sphere", () => {
    const world = generateWorld(3);
    for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
      const [x, y, z] = [
        world.mesh.vertices[vertex * 3] ?? 0,
        world.mesh.vertices[vertex * 3 + 1] ?? 0,
        world.mesh.vertices[vertex * 3 + 2] ?? 0,
      ];
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
    }
  });

  it("is colder at the pole than at the equator", () => {
    const world = generateWorld(11);
    expect(averageTemperatureNear(world, 0.95)).toBeLessThan(averageTemperatureNear(world, 0.05));
  });

  it("leaves roughly the share of the surface under water that it was asked for", () => {
    const world = generateWorld(5);
    const underwater = Array.from(world.elevation).filter((height) => height <= world.seaLevel).length;
    expect(underwater / world.elevation.length).toBeCloseTo(0.55, 1);
  });

  it("paints something", () => {
    expect(isPainted(generateWorld(2))).toBe(true);
  });
});

describe("the order of the pipeline", () => {
  it("is meaning, not style: painting first leaves one flat colour", () => {
    const tooEarly = generateWorld(4, [colourise, fractalise, temperatures, sea()]);
    expect(isPainted(tooEarly)).toBe(true);
    expect(coloursIn(tooEarly)).toBe(1);
    expect(coloursIn(generateWorld(4, PIPELINE))).toBeGreaterThan(50);
  });

  it("paints one colour per face, with no blending across the edges", () => {
    const world = generateWorld(6);
    expect(acrossFace(world, world.elevation, 0)).not.toBeNaN();
    expect(coloursIn(world)).toBeLessThanOrEqual(world.mesh.faceCount);
  });

  it("gives a different planet when the sea is chosen before the land is raised", () => {
    const wrong = generateWorld(4, [sea(), fractalise, temperatures, colourise]);
    const right = generateWorld(4, PIPELINE);
    expect(wrong.seaLevel).not.toBe(right.seaLevel);
  });

  it("runs every filter the pipeline names", () => {
    expect(PIPELINE).toHaveLength(4);
    const world = generateWorld(1);
    expect(world.elevation.some((height) => height !== 0)).toBe(true);
    expect(world.temperature.some((degree) => degree !== 0)).toBe(true);
  });
});
