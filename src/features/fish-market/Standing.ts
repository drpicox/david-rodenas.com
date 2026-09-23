/** One row of the board at the back of the room. */
export interface Standing {
  readonly name: string;
  readonly credit0: number;
  readonly credit: number;
  readonly spent: number;
  readonly lots: number;
  readonly value: number;
  readonly profit: number;
  /** What a bidder last said instead of a number, if it broke. */
  readonly error: string | null;
}
