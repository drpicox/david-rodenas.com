import { describe, expect, it } from "vitest";
import { Network } from "./Network";

const XOR: [number[], number[]][] = [
  [[0, 0], [0]],
  [[0, 1], [1]],
  [[1, 0], [1]],
  [[1, 1], [0]],
];

describe("a network of two layers of weights, taught by backpropagation", () => {
  it("answers with one number between 0 and 1 for each output", () => {
    const answer = new Network([2, 3, 4], 1).answer([1, 0]);
    expect(answer).toHaveLength(4);
    for (const value of answer) expect(value).toBeGreaterThan(0), expect(value).toBeLessThan(1);
  });

  it("is the same network every time it grows from the same seed", () => {
    expect(new Network([3, 4, 2], 7).answer([1, 0, 1])).toEqual(new Network([3, 4, 2], 7).answer([1, 0, 1]));
    expect(new Network([3, 4, 2], 7).answer([1, 0, 1])).not.toEqual(new Network([3, 4, 2], 8).answer([1, 0, 1]));
  });

  it("learns what one layer cannot: exclusive or", () => {
    const network = new Network([2, 4, 1], 3);
    for (let round = 0; round < 4000; round += 1) for (const [input, target] of XOR) network.learn(input, target, 0.5);
    for (const [input, target] of XOR) expect(network.answer(input)[0]).toBeCloseTo(target[0]!, 1);
  });

  it("says how wrong it was before each correction, and is less wrong after it", () => {
    const network = new Network([2, 3, 1], 5);
    const before = network.learn([1, 0], [1], 0.5);
    const after = network.learn([1, 0], [1], 0.5);
    expect(after).toBeLessThan(before);
  });
});
