/** What a refresh is handed to reach the disk and the network, so that a test can hand it a disk and a portal of its own. */
export interface RefreshPorts {
  /** The text of a file, or null when there is none. */
  read(path: string): string | null;
  write(path: string, text: string): void;
  fetchJson(url: string): Promise<unknown>;
  /** The words a portal answers with, for one that does not answer in JSON. */
  fetchText(url: string): Promise<string>;
  readonly today: Date;
  log(line: string): void;
}
