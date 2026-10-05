/**
 * The sizes a node is drawn at, in the canvas's own units: the still the
 * build draws, the canvas the reader works on, the tidying that places nodes
 * and the hand that finds a pin all read them here, so a wire always ends
 * where its pin is drawn.
 */
export const NODE = { width: 236, header: 30, row: 26, foot: 22 } as const;
