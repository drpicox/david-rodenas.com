/** A value written on a node by hand: a number, a word, or yes and no. */
export type Literal = number | string | boolean;

/** One name of a list, and how it is said. */
export interface Choice {
  readonly value: string;
  readonly label: string;
}

/**
 * How an input is written on its node when no wire brings it: a quantity, one
 * of a list, a column of the table handed to another input of the same node,
 * some words, or yes and no.
 */
export type Editor =
  | { readonly kind: "number"; readonly min?: number; readonly max?: number; readonly step?: number; readonly show?: (value: number) => string }
  | { readonly kind: "choice"; readonly choices: readonly Choice[] }
  | { readonly kind: "column"; readonly of: string; readonly numeric?: boolean }
  /**
   * A value of a column of the table handed to another input, chosen by
   * another input: one of its values, where a test asks for one; a number in
   * its range, where a test compares numbers; words, where it asks for more.
   */
  | { readonly kind: "values"; readonly of: string; readonly column: string; readonly test: string }
  | { readonly kind: "text"; readonly lines?: number }
  | { readonly kind: "flag" };

/** What a node takes. */
export interface InputPin {
  readonly name: string;
  readonly label: string;
  /** The name of what flows into it: a table, a number. */
  readonly type: string;
  /** What it holds when nothing is wired to it and nothing written on it. Without one, it has to be given, unless it is optional. */
  readonly initial?: Literal;
  /** May be left empty: the node does without it, or chooses for itself. */
  readonly optional?: boolean;
  /** How it is written on its node; or, where what it can be depends on data, how to find out from the files the site serves. */
  readonly editor?: Editor | ((read: (path: string) => string) => Editor);
  /** What it means, for whoever points at it. */
  readonly hint?: string;
}

/** What a node gives. */
export interface OutputPin {
  readonly name: string;
  readonly label: string;
  readonly type: string;
  readonly hint?: string;
}

/** A picture a node paints: markup, drawn the same at build time and in the browser. */
export interface Painting {
  readonly html: string;
  /** What it shows, in words, for whoever does not see it. */
  readonly caption?: string;
  /** Who measured what it shows, and when: said under it. */
  readonly credits?: readonly string[];
}

/** What one run of a node gives. */
export interface Ran {
  readonly outputs?: Readonly<Record<string, unknown>>;
  readonly painting?: Painting;
  /** What it chose itself where an input was left to it — the column a chart took for its x — so the node can say so. */
  readonly settled?: Readonly<Record<string, Literal>>;
  /** One line on what came out, for the node's foot, when its outputs do not say it best. */
  readonly said?: string;
}

/** What a node is handed besides its inputs: the files the site serves, by the path the browser asks for them at. */
export interface RunContext {
  read(path: string): string;
}

/** What a node is for, which is how it is coloured and where its results go: data coming in, a step, a statistic, a picture, a dial on the board, a note. */
export type Role = "source" | "step" | "statistic" | "paint" | "dial" | "note";

/**
 * A kind of node: what it takes, what it gives, and the pure function from
 * one to the other. A feature brings the kinds about its own data; the frame
 * brings the ones every blueprint needs. Written once, a kind is a box on the
 * canvas, a line of a blueprint's text, and a step of the still the build
 * draws, all at once.
 */
export interface NodeKind {
  /** The word a blueprint's text calls it by. */
  readonly name: string;
  readonly title: string;
  readonly role: Role;
  /** The shelf of the menu it is found on: The source, Weather, Tables… */
  readonly shelf: string;
  /** One line on what it does, for the menu and for whoever points at it. */
  readonly summary: string;
  /**
   * A kind on trial: offered in the menu, and among what could come next,
   * only while this flag is on. It runs either way, so a blueprint that
   * names it works for every reader.
   */
  readonly flag?: string;
  readonly inputs: readonly InputPin[];
  readonly outputs: readonly OutputPin[];
  /** Handed every input, settled; throws, in words, what it could not do. */
  run(inputs: Readonly<Record<string, unknown>>, context: RunContext): Ran;
}
