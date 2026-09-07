import { describe, expect, it } from "vitest";
import { generateWorld } from "./generateWorld";
import { renderSphere } from "./renderSphere";

const SIZE = 64;
const world = generateWorld(9);

function alphaAt(pixels: Uint8ClampedArray, x: number, y: number): number {
  return pixels[(y * SIZE + x) * 4 + 3] ?? 0;
}

/** Mean brightness of the pixels of the disc inside a quarter of the frame. */
function brightnessOfQuarter(pixels: Uint8ClampedArray, left: boolean): number {
  let total = 0;
  let counted = 0;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = left ? 0 : SIZE / 2; x < (left ? SIZE / 2 : SIZE); x += 1) {
      const at = (y * SIZE + x) * 4;
      if ((pixels[at + 3] ?? 0) === 0) continue;
      total += ((pixels[at] ?? 0) + (pixels[at + 1] ?? 0) + (pixels[at + 2] ?? 0)) / 3;
      counted += 1;
    }
  }
  return counted === 0 ? 0 : total / counted;
}

describe("renderSphere", () => {
  const front = renderSphere(world, SIZE, { rotation: 0 });

  it("draws a disc, not a square", () => {
    expect(alphaAt(front, 0, 0)).toBe(0);
    expect(alphaAt(front, SIZE - 1, 0)).toBe(0);
    expect(alphaAt(front, SIZE / 2, SIZE / 2)).toBe(255);
  });

  it("lights the side the sun is on", () => {
    expect(brightnessOfQuarter(front, true)).toBeGreaterThan(brightnessOfQuarter(front, false));
  });

  it("moves the light with the sun", () => {
    const fromTheRight = renderSphere(world, SIZE, { rotation: 0, light: [0.6, 0.3, 0.7] });
    expect(brightnessOfQuarter(fromTheRight, false)).toBeGreaterThan(brightnessOfQuarter(fromTheRight, true));
  });

  it("shows the same face for the same angle", () => {
    expect(Array.from(renderSphere(world, SIZE, { rotation: 1.2 }))).toEqual(
      Array.from(renderSphere(world, SIZE, { rotation: 1.2 })),
    );
  });

  it("turns: half a revolution shows another face", () => {
    const back = renderSphere(world, SIZE, { rotation: Math.PI });
    expect(Array.from(back)).not.toEqual(Array.from(front));
  });

  it("comes back round after a whole revolution", () => {
    const round = renderSphere(world, SIZE, { rotation: Math.PI * 2 });
    const centre = (SIZE / 2) * SIZE * 4 + (SIZE / 2) * 4;
    expect(round[centre]).toBeCloseTo(front[centre] ?? 0, 0);
  });
});
