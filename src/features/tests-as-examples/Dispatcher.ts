/** One way of writing the dispatcher, to run the same tests against. */
export interface Dispatcher {
  readonly name: string;
  readonly label: string;
  /** What changed, said to the reader. */
  readonly said: string;
  /** A `class Dispatcher`, as source. */
  readonly source: string;
}
