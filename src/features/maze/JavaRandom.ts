const MULTIPLIER = 0x5deece66dn;
const ADDEND = 0xbn;
const MASK = (1n << 48n) - 1n;

/**
 * java.util.Random, the generator the maze of 2001 was grown with. Only with
 * the same forty-eight-bit congruence does a seed give the same maze it gave
 * then, so the one the files kept can be grown again and compared wall for wall.
 */
export class JavaRandom {
  private seed: bigint;

  constructor(seed: number) {
    this.seed = (BigInt(seed) ^ MULTIPLIER) & MASK;
  }

  /** Java's `nextInt(bound)`, including the draw it throws away so every value is equally likely. */
  nextInt(bound: number): number {
    if ((bound & -bound) === bound) return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    for (;;) {
      const bits = this.next(31);
      const value = bits % bound;
      // In Java's int arithmetic this sum overflows, and the draw is refused, only in the last partial run of values.
      if (((bits - value + (bound - 1)) | 0) >= 0) return value;
    }
  }

  private next(bits: number): number {
    this.seed = (this.seed * MULTIPLIER + ADDEND) & MASK;
    return Number(BigInt.asIntN(32, this.seed >> BigInt(48 - bits)));
  }
}
