/** A line the headline can say, over up to three lines, and where on the site it leads if it leads anywhere. */
export interface Headline {
  readonly text: string;
  readonly href?: string;
}
