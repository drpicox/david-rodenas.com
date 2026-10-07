/** What a cell holds: a number, a word, or nothing, where nothing was measured. */
export type Cell = number | string | null;

/** One column: the name wires and formulas call it by, whether it holds numbers or words, and the unit of its numbers. */
export interface Column {
  readonly name: string;
  readonly kind: "number" | "text";
  /** As it is written after a number: °C, µg/m³, days. */
  readonly unit?: string;
  /** What it is, in a few words, for whoever does not know the name. */
  readonly about?: string;
  /** It says which row a row is — a year, a month, a station — rather than what was measured there: what two tables are joined on. */
  readonly key?: boolean;
  /** It came into the table from the second of two joined: what a measure of one source is set against. */
  readonly joined?: boolean;
  /** The order its words are named in, where it is not the alphabet's nor the rows': winter, spring, summer, autumn. */
  readonly order?: readonly string[];
}

export type Row = Readonly<Record<string, Cell>>;

/** Who measured what a table holds, and when it was last brought up to date: said under every picture made of it. */
export interface Credit {
  readonly said: string;
  /** YYYY-MM-DD. */
  readonly refreshed?: string;
}

/**
 * What flows along most wires: rows of named columns. Every source of data
 * gives one — the months at a weather station, the hours at a measuring
 * point, the files of this site's source — so that every step, every
 * statistic and every picture works on all of them alike, and two of them
 * can be set side by side.
 */
export interface Table {
  readonly columns: readonly Column[];
  readonly rows: readonly Row[];
  readonly credits?: readonly Credit[];
}
