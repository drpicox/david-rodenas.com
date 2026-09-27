/** Where the reader's flags are kept: which are on, and how each came to be. In the browser, storage and the root element; in a test, a set. */
export interface FlagStore {
  isOn(name: string): boolean;
  /** The reader's own choice: it takes the flag out of any trial, for good. */
  set(name: string, on: boolean): void;
  /** Whether the reader has ever chosen this flag themselves. */
  chosen(name: string): boolean;
  /** What the lot said for this reader, if it has been drawn. */
  drawn(name: string): boolean | undefined;
  /** Keeps what the lot said, and turns the flag on or off to match. */
  draw(name: string, on: boolean): void;
}
