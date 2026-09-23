import { describe, expect, it } from "vitest";
import { JavaRandom } from "./JavaRandom";

// Every expected number below was printed by java.util.Random on a JDK 17, today.
describe("java.util.Random, number for number", () => {
  it("deals what Java dealt from seed 543, the seed of the maze of 20 May 2001", () => {
    const random = new JavaRandom(543);
    const dealt = [
      ...Array.from({ length: 8 }, () => random.nextInt(3)),
      ...Array.from({ length: 8 }, () => random.nextInt(10)),
      ...Array.from({ length: 8 }, () => random.nextInt(7)),
    ];
    expect(dealt).toEqual([2, 2, 0, 2, 0, 1, 2, 1, 3, 6, 3, 1, 8, 9, 9, 8, 3, 3, 0, 4, 4, 2, 5, 5]);
  });

  it("agrees on a negative seed, a power of two, and a bound that makes Java draw again", () => {
    const random = new JavaRandom(-1234567890123);
    const dealt = [...Array.from({ length: 6 }, () => random.nextInt(1000)), random.nextInt(1 << 20), random.nextInt(64), random.nextInt(1000000007)];
    expect(dealt).toEqual([488, 883, 897, 673, 610, 124, 1037220, 6, 246643009]);
  });
});
