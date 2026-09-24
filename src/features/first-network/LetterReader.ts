import { randomOf } from "../../platform/random/randomOf";
import { Network } from "./Network";
import type { Shape } from "./Shape";

/** Enough hidden nodes for nine letters and a few of the visitor's on twenty-five cells, few enough to train in the time it takes to click. */
const HIDDEN = 10;
const RATE = 0.5;

/**
 * A network with one output per drawing it is taught, and the lessons: each
 * round shows it every drawing clean, and every drawing again with one cell
 * wrong, so it learns the letter rather than the exact drawing.
 */
export class LetterReader {
  readonly network: Network;
  private readonly noise: () => number;
  rounds = 0;
  error = 0;

  constructor(
    readonly shapes: readonly Shape[],
    seed: number,
  ) {
    this.network = new Network([25, HIDDEN, shapes.length], seed);
    this.noise = randomOf(seed + 1);
  }

  train(rounds: number): void {
    for (let round = 0; round < rounds; round += 1) {
      let error = 0;
      this.shapes.forEach(({ pixels: clean }, index) => {
        const target = this.shapes.map((_, other) => (other === index ? 1 : 0));
        const wrong = Math.floor(this.noise() * clean.length);
        error += this.network.learn(clean, target, RATE);
        error += this.network.learn(
          clean.map((pixel, at) => (at === wrong ? 1 - pixel : pixel)),
          target,
          RATE,
        );
      });
      this.error = error;
      this.rounds += 1;
    }
  }

  read(pixels: readonly number[]): { letter: string; score: number }[] {
    const answer = this.network.answer(pixels);
    return this.shapes.map(({ name }, index) => ({ letter: name, score: answer[index]! }));
  }
}
