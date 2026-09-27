/** One source file: a ball in the picture. */
export interface Module {
  /** Relative to `src/`, as it is written in an import: `platform/shell/Shell.ts`. */
  readonly path: string;
  readonly lines: number;
  /** A test is a module too, so the picture can say what the tests reach. */
  readonly test: boolean;
}

/**
 * One file needing another: an arrow, and it always has a head. An arrow
 * that only needs a type is drawn apart, because depending on an interface
 * rather than on what implements it is the whole of dependency inversion.
 */
export interface Dependency {
  readonly from: string;
  readonly to: string;
  readonly typeOnly: boolean;
}

/** The source as TypeScript sees it: the files, and which needs which. */
export interface SourceGraph {
  readonly modules: readonly Module[];
  readonly dependencies: readonly Dependency[];
}
