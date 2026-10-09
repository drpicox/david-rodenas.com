/**
 * A trial the site can be switched into, one reader at a time. A feature
 * declares it; the frame keeps it, reads it off a link, and marks the root
 * element `data-flags="name …"` while it is on. What it changes is the
 * feature's business, most often a stylesheet rule under that mark.
 */
export interface Flag {
  /** The word at the prompt, in the address (`?name=on`) and in `data-flags`. */
  readonly name: string;
  /** One line on what turning it on changes. */
  readonly description: string;
  /**
   * The share of readers it is on for, drawn once for each one, for a trial
   * that is weighed by what they do: `0.5` is one in two. A reader who
   * chooses for themselves has left the trial.
   */
  readonly trial?: number;
  /**
   * The ways it can be on, when there is more than one to choose between —
   * `flags search palette`, `?search=palette`, and `search=palette` in
   * `data-flags` — and off besides. A flag with choices is never drawn in a
   * trial: a lot says on or off, not which.
   */
  readonly choices?: readonly string[];
}
