import { randomOf } from "../../platform/random/randomOf";

const squash = (x: number) => 1 / (1 + Math.exp(-x));

/**
 * A layered network and the one way it learns: backpropagation. Each node
 * sums its inputs by its weights, plus a bias, and squashes the sum between
 * 0 and 1. The page prints `learn` as it is, so it is written to be read.
 */
export class Network {
  /** weights[layer][node][input]; the last input of every node is its bias, always 1. */
  readonly weights: number[][][];

  constructor(sizes: readonly number[], seed: number) {
    const random = randomOf(seed);
    // Small and different: equal weights would make every hidden node learn the same thing.
    this.weights = sizes.slice(1).map((size, layer) => Array.from({ length: size }, () => Array.from({ length: sizes[layer]! + 1 }, () => random() - 0.5)));
  }

  /** Every layer's values, the input first and the answer last. */
  private forward(input: readonly number[]): number[][] {
    const values = [[...input]];
    for (const layer of this.weights) {
      const below = [...values[values.length - 1]!, 1];
      values.push(layer.map((weights) => squash(weights.reduce((sum, weight, i) => sum + weight * below[i]!, 0))));
    }
    return values;
  }

  answer(input: readonly number[]): number[] {
    return this.forward(input).pop()!;
  }

  /** One example, one correction. Returns how wrong it was before the correction. */
  learn(input: readonly number[], target: readonly number[], rate: number): number {
    const values = this.forward(input);
    const output = values[values.length - 1]!;
    // Each output is to blame for its error,
    // times the slope of the squash where it stands.
    let blame = output.map((value, n) => {
      return (value - target[n]!) * value * (1 - value);
    });
    for (let layer = this.weights.length - 1; layer >= 0; layer -= 1) {
      const below = [...values[layer]!, 1];
      const nodes = this.weights[layer]!;
      // A node below takes the blame of the nodes it feeds,
      // by its weight on each: before those weights move.
      const passed = values[layer]!.map((value, i) => {
        let sum = 0;
        for (let n = 0; n < nodes.length; n += 1) {
          sum += nodes[n]![i]! * blame[n]!;
        }
        return sum * value * (1 - value);
      });
      for (let n = 0; n < nodes.length; n += 1) {
        for (let i = 0; i < below.length; i += 1) {
          nodes[n]![i]! -= rate * blame[n]! * below[i]!;
        }
      }
      blame = passed;
    }
    let error = 0;
    for (let n = 0; n < output.length; n += 1) {
      error += (output[n]! - target[n]!) ** 2;
    }
    return error / 2;
  }
}
