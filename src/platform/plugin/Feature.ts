import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import type { YearlySource } from "../data/YearlySource";
import type { Command } from "../shell/Command";

/** What a program is handed besides its place: the site it stands in, for the few that read it. */
export interface Surroundings {
  readonly site: Site;
}

/**
 * A program a page makes room for: `::name` in the markdown becomes its host.
 * Returns how to stop it. The site is handed over rather than imported,
 * because a feature is also loaded in node — for its stills and its sources —
 * where the browser's copy of the site does not exist.
 */
export type App = (host: HTMLElement, surroundings: Surroundings) => (() => void) | void;

/**
 * What a program's place holds before any script runs, written into the HTML
 * at build time. `read` gives the text of a file the site serves, by the path
 * the browser would ask for it at — so a still and its program read the same data.
 */
export type Still = (read: (path: string) => string) => string;

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
  /** What stands in a program's place in the HTML, by the program's name. Runs in node: no DOM. */
  readonly stills?: Readonly<Record<string, Still>>;
  /** Open data it keeps a copy of in the repository, refreshed before a build when the year has changed. */
  readonly sources?: readonly YearlySource<unknown>[];
  /** Once, when the page is first set up. Returns how to undo it. */
  install?(prompt: Prompt): (() => void) | void;
  /** Whenever the page changes without a reload, and once for the page it started on. */
  arrive?(page: Page): void;
}
