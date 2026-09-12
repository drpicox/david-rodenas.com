/** One character cell of a world in text mode: the card's colour number of its top pixel and its bottom one, or -1 for sky. */
export interface TextCell {
  readonly top: number;
  readonly bottom: number;
}
