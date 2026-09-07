/** A markdown file as it comes off disk, before anything has been read of it. */
export interface Source {
  /** Relative to the content root: `work/orion.md`, `index.md`. */
  readonly file: string;
  readonly markdown: string;
}

/** One page of the site: one file, one URL, one entry in a directory listing. */
export interface Page {
  readonly file: string;
  /** The URL, always with a trailing slash: `/`, `/work/`, `/work/orion/`. */
  readonly route: string;
  /** The directory it lists under: `/` for `/work/`, `/work/` for `/work/orion/`. */
  readonly parent: string | null;
  /** The name `ls` prints. */
  readonly name: string;
  readonly title: string;
  readonly summary: string;
  /** Directories sort by this, then by name. */
  readonly order: number;
  readonly body: string;
  readonly fields: Readonly<Record<string, string>>;
}
