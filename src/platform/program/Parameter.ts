/**
 * One thing a program can be told, said once for everyone who tells it: the
 * dial a reader slides, the `--name value` a reader types, and the field an
 * agent fills in. The name is the word on the command line.
 */
export interface Parameter {
  /** The option's word: `--interest 10`. */
  readonly name: string;
  /** What the dial is called. */
  readonly label: string;
  /** What it means, for whoever has not seen the dial: a reader asking `--help`, or an agent. */
  readonly description: string;
  readonly min: number;
  readonly max: number;
  /** How far the dial moves in one step, measured on its own scale. */
  readonly step: number;
  /** What the program starts with. */
  readonly initial: number;
  /** Where a quantity spans too many sizes to slide along, the dial slides along its logarithm. */
  readonly scale?: "log";
  /** How the value is said beside its dial; the number itself when there is nothing better to say. */
  readonly show?: (value: number) => string;
}
