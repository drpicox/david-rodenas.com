import { describe, expect, it } from "vitest";
import { colourise, fractalise, sea, temperatures } from "./filters";
import { generateWorld, PIPELINE } from "./generateWorld";
import { latitudeOfVertex, type World } from "./World";

/** Mean warmth of the corners whose latitude falls in a band. */
function warmthNear(world: World, latitude: number): number {
  let total = 0;
  let counted = 0;
  for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
    if (Math.abs(latitudeOfVertex(world, vertex) - latitude) > 0.1) continue;
    total += world.temperature[vertex] ?? 0;
    counted += 1;
  }
  return counted === 0 ? 0 : total / counted;
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
    expect([...generateWorld(7).mesh.radii]).toEqual([...generateWorld(7).mesh.radii]);
  });

  it("grows a different world from a different seed", () => {
    expect([...generateWorld(7).mesh.radii]).not.toEqual([...generateWorld(8).mesh.radii]);
  });

  it("is made of triangles you can count", () => {
    const world = generateWorld(3);
    expect(world.mesh.faceCount).toBe(20 * 4 ** 4);
    expect(world.faceColour.length).toBe(world.mesh.faceCount * 3);
  });

  it("has real relief, not a painted ball", () => {
    const radii = [...generateWorld(3).mesh.radii];
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(0.05);
  });

  it("is colder at the pole than at the equator", () => {
    const world = generateWorld(11);
    expect(warmthNear(world, 0.95)).toBeLessThan(warmthNear(world, 0.05));
  });

  it("paints something, and something worth reading", () => {
    const world = generateWorld(2);
    expect(coloursIn(world)).toBeGreaterThan(20);
    expect(coloursIn(world)).toBeLessThanOrEqual(world.mesh.faceCount);
  });
});

describe("the sea", () => {
  const world = generateWorld(5);

  it("is a minimum radius: nothing is left below it", () => {
    expect([...world.mesh.radii].every((radius) => radius >= world.seaRadius - 1e-6)).toBe(true);
  });

  it("flattens the share of the surface it was asked for onto one sphere", () => {
    const flooded = [...world.mesh.radii].filter((radius) => Math.abs(radius - world.seaRadius) < 1e-6);
    expect(flooded.length / world.mesh.vertexCount).toBeGreaterThan(0.4);
  });

  it("leaves the land standing above it", () => {
    expect(Math.max(...world.mesh.radii)).toBeGreaterThan(world.seaRadius * 1.01);
  });
});

describe("the order of the pipeline", () => {
  it("is meaning, not style: painting first leaves one flat colour", () => {
    const tooEarly = generateWorld(4, [colourise, fractalise(), temperatures(), sea()]);
    expect(coloursIn(tooEarly)).toBe(1);
    expect(coloursIn(generateWorld(4, PIPELINE))).toBeGreaterThan(20);
  });

  it("drowns the world when the sea is put in before the land is raised", () => {
    const wrong = generateWorld(4, [sea(), fractalise(), temperatures(), colourise]);
    // A perfect sphere has one radius, so the sea takes all of it and the
    // land that comes afterwards has nothing to stand above.
    expect(wrong.seaRadius).toBe(1);
    expect(generateWorld(4, PIPELINE).seaRadius).not.toBe(1);
  });

  it("runs every filter the pipeline names", () => {
    expect(PIPELINE).toHaveLength(4);
  });
});
