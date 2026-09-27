import { latitudeOfVertex } from "../latitudeOfVertex";
import type { Filter } from "../World";

export interface Climate {
  /** Warmth at sea level on the equator. */
  readonly equator: number;
  /** Warmth at the pole, at sea level. */
  readonly pole: number;
  /** Warmth at the highest summit, wherever it stands. */
  readonly peak: number;
}

/**
 * Warmth from latitude and from height above the sea, between three fixed
 * points — the equator, the pole and the summit — which is how the original
 * `PosarTemperatura` asked for it. Height is a straight line to the summit's
 * number, and the summit's number is below freezing: that is what puts snow
 * on the Himalaya and on the Teide, neither of them anywhere near a pole.
 * Run after the sea, so the lowest point is sea level.
 */
export const temperatures =
  ({ equator = 1, pole = 0.05, peak = 0 }: Partial<Climate> = {}): Filter =>
  (world) => {
    const temperature = new Float32Array(world.mesh.vertexCount);
    const radii = world.mesh.radii;
    const lowest = radii.reduce((low, radius) => Math.min(low, radius), Infinity);
    const highest = radii.reduce((high, radius) => Math.max(high, radius), -Infinity);
    const span = highest - lowest || 1;

    for (let vertex = 0; vertex < world.mesh.vertexCount; vertex += 1) {
      const height = ((radii[vertex] ?? 1) - lowest) / span;
      const fromEquator = latitudeOfVertex(world, vertex) ** 2.2;
      temperature[vertex] = equator + (pole - equator) * fromEquator + (peak - equator) * height;
    }

    return { ...world, temperature };
  };
