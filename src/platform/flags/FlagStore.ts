/** Where the reader's flags are kept: which are on, and the switch for each. In the browser, storage and the root element; in a test, a set. */
export interface FlagStore {
  isOn(name: string): boolean;
  set(name: string, on: boolean): void;
}
