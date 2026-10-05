/**
 * A file a node asked for that has not arrived yet. Thrown by whoever reads
 * the files in the browser, where they come over the network; the blueprint
 * waits for it and is run again once it is there. At build time every file is
 * at hand, and nothing is ever pending.
 */
export class Pending extends Error {
  constructor(readonly path: string) {
    super(`waiting for ${path}`);
  }
}
