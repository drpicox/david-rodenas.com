import type { Example } from "../blueprint/examplesOf";
import type { Kit } from "../blueprint/kitOf";

/**
 * The files the site serves, as a bench in the browser reads them: at once
 * when they are here; one still on its way throws `Pending`, and whoever
 * listens is told when it arrives.
 */
export interface BenchFiles {
  read(path: string): string;
  /** Told whenever a file arrives or is found missing; returns how to stop being told. */
  listen(listener: () => void): () => void;
}

/** Where a bench stands, and what it is handed. */
export interface BenchSetting {
  readonly kit: Kit;
  readonly files: BenchFiles;
  /** The blueprints the page writes: the first is the one it opens on, any of them can be opened, and Reset goes back to the one open. */
  readonly examples: readonly Example[];
  /** Where to start instead: another of the examples, or a version of it a link carried, and what to say about that. */
  readonly start?: { readonly example?: Example; readonly text?: string; readonly said?: string };
  /** The board the build wrote, shown until the blueprint has run here: the pictures do not blink out while it does. */
  readonly stillBoard?: string;
  /** The reader's own version of each example, told after every edit, and told nothing when it is the example again. */
  readonly own: { get(example: Example): string | null; set(example: Example, text: string | null): void };
  /** Told which example is open, once the reader opens another, so that the address can say it. */
  opened?(example: Example): void;
  /** Whether a flag is on: a kind on trial is offered only while its own is. */
  isOn?(flag: string): boolean;
  /** A link that opens this blueprint as it now is, a version of the example it came from. */
  linkTo(example: Example, text: string): string;
  copy(text: string): Promise<void>;
}

/**
 * Somewhere a blueprint written in a page is worked on, in the still's
 * place: the frame's own workbench, with its canvas and its wires to drag,
 * or another a feature brings behind a flag. Whoever puts it on the page
 * asks no more of it than this, so the page's blueprints, the address that
 * names one, a reader's own version of each, and an agent's blueprint reach
 * every bench alike.
 */
export interface Bench {
  readonly element: HTMLElement;
  /** Put on the page: it can now measure the room it has. */
  placed(): void;
  /** Near the screen: run the blueprint, and from now on whenever it changes. */
  wake(): void;
  /** One of the page's examples, opened here. */
  open(example: Example): void;
  /** A blueprint written by someone else — an agent — shown as an edit, so that it can be undone. */
  ask(text: string): void;
  stop(): void;
}

/** How a bench is made, from where it stands. */
export type BenchMaker = (setting: BenchSetting) => Bench;
