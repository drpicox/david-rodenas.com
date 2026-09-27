/** The source at one commit, with every module numbered by its lineage. */
export interface Snapshot {
  readonly modules: readonly { readonly id: number; readonly path: string; readonly lines: number; readonly test: boolean; readonly typesOnly?: boolean }[];
  readonly dependencies: readonly { readonly from: number; readonly to: number; readonly typeOnly: boolean }[];
}
