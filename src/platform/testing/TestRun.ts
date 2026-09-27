/** What running a test file said: each test in order, and the first thing that went wrong. */
export interface TestRun {
  readonly passed: boolean;
  /** The first failure, as the runner words it; absent when every test passes. */
  readonly message?: string;
  readonly results: readonly { readonly name: string; readonly passed: boolean; readonly message?: string }[];
}
