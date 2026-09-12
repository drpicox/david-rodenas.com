import { describe, expect, it } from "vitest";
import { generateWorld } from "./generateWorld";
import { renderSphere } from "./renderSphere";
import { textCells } from "./textCells";

describe("textCells", () => {
  it("folds a square picture into cells half as many rows tall, two pixels to a cell", () => {
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    // Row 0 red, row 1 white; rows 2 and 3 left as sky.
    for (let x = 0; x < 4; x += 1) {
      pixels.set([255, 85, 85, 255], (0 * 4 + x) * 4);
      pixels.set([255, 255, 255, 255], (1 * 4 + x) * 4);
    }
    const cells = textCells(pixels, 4);
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveLength(4);
    expect(cells[0]?.[0]).toEqual({ top: 12, bottom: 15 });
    expect(cells[1]?.[3]).toEqual({ top: -1, bottom: -1 });
  });

  it("shows a grown world as a disc of the card's colours with sky at the corners", () => {
    const size = 16;
    const cells = textCells(renderSphere(generateWorld(1999), size, { rotation: 0.6 }), size);
    const corner = cells[0]?.[0];
    const middle = cells[4]?.[8];
    expect(corner).toEqual({ top: -1, bottom: -1 });
    expect(middle?.top).toBeGreaterThanOrEqual(0);
    expect(middle?.top).toBeLessThan(16);
  });
});
