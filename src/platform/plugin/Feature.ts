import type { Page } from "../content/Page";
import type { Command } from "../shell/Command";

/** A program a page makes room for: `::name` in the markdown becomes its host. Returns how to stop it. */
export type App = (host: HTMLElement) => (() => void) | void;

/** What a feature is handed when it is installed: the site's one control surface. */
export interface Prompt {
  /** Runs a line as if it had been typed, echo and all. */
  run(line: string): void;
}

/**
 * Everything a feature may plug into, and nothing it must.
 *
 * The frame knows this shape and no feature by name. A feature that wants a
 * command brings one; one that wants a program in a page names it; one that
 * has to do something when the page changes says so. Deleting a feature is
 * deleting its folder and its line in `allFeatures`.
 */
export interface Feature {
  readonly name: string;
  /** Commands it adds to the shell, alongside the site's own. */
  readonly commands?: readonly Command[];
  /** Programs it offers, by the name the markdown calls them. */
  readonly apps?: Readonly<Record<string, App>>;
  /** Once, when the page is first set up. Returns how to undo it. */
  install?(prompt: Prompt): (() => void) | void;
  /** Whenever the page changes without a reload, and once for the page it started on. */
  arrive?(page: Page): void;
}
