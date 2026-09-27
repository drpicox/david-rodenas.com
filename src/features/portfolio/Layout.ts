/**
 * How the lists of a page are laid out, to whoever is asking: plain, or as
 * cards with their pictures. The command is about words; doing it needs a
 * root element and storage, which is the browser's side of this line.
 */
export interface Layout {
  /** Takes a choice, and answers whether cards are now on. A toggle only it can resolve. */
  apply(choice: "on" | "off" | "toggle"): boolean;
}
