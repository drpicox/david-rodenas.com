import { describe, expect, it } from "vitest";
import { generateWorld } from "./generateWorld";
import { renderSphere } from "./renderSphere";

const SIZE = 96;
const world = generateWorld(9);

function covered(pixels: Uint8ClampedArray, x: number, y: number): boolean {
  return (pixels[(y * SIZE + x) * 4 + 3] ?? 0) > 0;
}

function brightnessOfHalf(pixels: Uint8ClampedArray, left: boolean): number {
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

/** The furthest and the nearest point of the outline, from the centre. */
function outline(pixels: Uint8ClampedArray): { furthest: number; nearest: number } {
  const middle = SIZE / 2;
  let furthest = 0;
  let nearest = Infinity;

  for (let angle = 0; angle < 360; angle += 3) {
    const radians = (angle * Math.PI) / 180;
    let edge = 0;
    for (let step = 1; step < middle; step += 0.5) {
      const x = Math.round(middle + Math.cos(radians) * step);
      const y = Math.round(middle + Math.sin(radians) * step);
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) break;
      if (covered(pixels, x, y)) edge = step;
    }
    furthest = Math.max(furthest, edge);
    nearest = Math.min(nearest, edge);
  }

  return { furthest, nearest };
}

describe("renderSphere", () => {
  const front = renderSphere(world, SIZE, { rotation: 0 });

  it("draws a body, not a square", () => {
    expect(covered(front, 0, 0)).toBe(false);
    expect(covered(front, SIZE / 2, SIZE / 2)).toBe(true);
  });

  it("lets the mountains break the outline", () => {
    // A painted ball would have exactly one radius all the way round.
    const { furthest, nearest } = outline(front);
    expect(nearest).toBeGreaterThan(0);
    expect(furthest - nearest).toBeGreaterThan(1.5);
  });

  it("lights the side the sun is on", () => {
    expect(brightnessOfHalf(front, true)).toBeGreaterThan(brightnessOfHalf(front, false));
  });

  it("moves the light with the sun", () => {
    const fromTheRight = renderSphere(world, SIZE, { rotation: 0, light: [0.6, 0.3, 0.7] });
    expect(brightnessOfHalf(fromTheRight, false)).toBeGreaterThan(brightnessOfHalf(fromTheRight, true));
  });

  it("shows the same face for the same angle", () => {
    expect([...renderSphere(world, SIZE, { rotation: 1.2 })]).toEqual([...renderSphere(world, SIZE, { rotation: 1.2 })]);
  });

  it("turns: half a revolution shows another face", () => {
    expect([...renderSphere(world, SIZE, { rotation: Math.PI })]).not.toEqual([...front]);
  });

  it("comes back round after a whole revolution", () => {
    expect([...renderSphere(world, SIZE, { rotation: Math.PI * 2 })]).toEqual([...front]);
  });

  it("keeps the far side behind the near one", () => {
    // With no depth buffer the back of the planet would paint over the front,
    // and the lit half would come out as dark as the other one.
    expect(brightnessOfHalf(front, true) / brightnessOfHalf(front, false)).toBeGreaterThan(1.2);
  });
});
