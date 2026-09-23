/** One box of fish on the floor: what it is, and what it resells for, which every buyer is told. */
export interface Lot {
  readonly id: number;
  readonly kind: string;
  readonly value: number;
}
