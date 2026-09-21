/** Downloads of every package, a finished year at a time: year, then package name. A package absent from a year had none. */
export interface NpmDownloads {
  readonly years: Readonly<Record<string, Readonly<Record<string, number>>>>;
}
