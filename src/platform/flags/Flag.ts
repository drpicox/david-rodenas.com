/**
 * A trial the site can be switched into, one reader at a time. A feature
 * declares it; the frame keeps it, reads it off a link, and marks the root
 * element `data-flags="name …"` while it is on. What it changes is the
 * feature's business, most often a stylesheet rule under that mark.
 */
export interface Flag {
  /** The word at the prompt, in the address (`?name=on`) and in `data-flags`. */
  readonly name: string;
  /** One line on what turning it on changes. */
  readonly description: string;
}
