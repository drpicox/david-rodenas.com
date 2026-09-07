import { describe, expect, it } from "vitest";
import { colourise, fractalise, sea, temperatures } from "./filters";
import { generateWorld, PIPELINE } from "./generateWorld";
import { latitudeOf, type World } from "./World";

function averageTemperatureOfRow(world: World, y: number): number {
  let total = 0;
  for (let x = 0; x < world.width; x += 1) total += world.temperature[y * world.width + x] ?? 0;
  return total / world.width;
}

function isPainted(world: World): boolean {
  return world.colour.some((channel) => channel !== 0);
}

/** How much the painting says: one colour is a world nobody can read. */
function coloursIn(world: World): number {
  const seen = new Set<number>();
  for (let index = 0; index < world.colour.length; index += 3) {
    seen.add(((world.colour[index] ?? 0) << 16) | ((world.colour[index + 1] ?? 0) << 8) | (world.colour[index + 2] ?? 0));
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

  it("has no seam where the map wraps", () => {
    const world = generateWorld(3);
    const middle = Math.floor(world.height / 2);
    const first = world.elevation[middle * world.width] ?? 0;
    const last = world.elevation[middle * world.width + world.width - 1] ?? 0;
    const typicalStep = 2 / world.width;
    expect(Math.abs(first - last)).toBeLessThan(typicalStep * 20);
  });

  it("is colder at the pole than at the equator", () => {
    const world = generateWorld(11);
    const equator = averageTemperatureOfRow(world, Math.floor(world.height / 2));
    const pole = averageTemperatureOfRow(world, 0);
    expect(pole).toBeLessThan(equator);
    expect(latitudeOf(world, 0)).toBeGreaterThan(latitudeOf(world, Math.floor(world.height / 2)));
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
    expect(coloursIn(generateWorld(4, PIPELINE))).toBeGreaterThan(1000);
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
