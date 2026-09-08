import { describe, expect, it } from "vitest";
import { generateWorld } from "./generateWorld";
import { renderSphere } from "./renderSphere";
import { SphereRaster } from "./SphereRaster";

const SIZE = 64;
const world = generateWorld(9);
const other = generateWorld(31);

describe("SphereRaster", () => {
  it("paints what the one-shot renderer paints", () => {
    const raster = new SphereRaster(SIZE);
    expect([...raster.paint(world, { rotation: 0.4 })]).toEqual([...renderSphere(world, SIZE, { rotation: 0.4 })]);
  });

  it("leaves nothing of one pass in the next", () => {
    const raster = new SphereRaster(SIZE);
    raster.paint(world, { rotation: 0.4 });
    expect([...raster.paint(world, { rotation: 0.4 })]).toEqual([...renderSphere(world, SIZE, { rotation: 0.4 })]);
  });

  // The depth buffer is the one that would tell: a stale depth hides a nearer face.
  it("leaves nothing of one world in the next, nor of one angle in the next", () => {
    const raster = new SphereRaster(SIZE);
    raster.paint(world, { rotation: 2.1 });
    expect([...raster.paint(other, { rotation: 0.4 })]).toEqual([...renderSphere(other, SIZE, { rotation: 0.4 })]);
  });

  it("paints into the buffer it was given, so a canvas can hand it its own", () => {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    const raster = new SphereRaster(SIZE, pixels);
    expect(raster.paint(world, { rotation: 0.4 })).toBe(pixels);
    expect([...pixels]).toEqual([...renderSphere(world, SIZE, { rotation: 0.4 })]);
  });

  it("hands back the same buffer every time, because reusing it is the point", () => {
    const raster = new SphereRaster(SIZE);
    expect(raster.paint(world, { rotation: 0.4 })).toBe(raster.paint(world, { rotation: 1.4 }));
  });

  it("refuses a buffer that is not the size of the picture", () => {
    expect(() => new SphereRaster(SIZE, new Uint8ClampedArray(4))).toThrow();
  });
});
