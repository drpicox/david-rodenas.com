/** What one of my essays on the kata says about a run of its commits, and where it says it. */
export interface KataLesson {
  /** The first commit and the last it speaks for, both included. */
  readonly commits: readonly [number, number];
  readonly title: string;
  readonly text: string;
  readonly essay: { readonly id: string; readonly title: string; readonly section: string };
}
