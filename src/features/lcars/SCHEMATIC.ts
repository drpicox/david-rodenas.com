/**
 * The sizes a schematic is drawn at, in its own units. Across a module: the
 * least room its name has, the ports where conduits arrive and leave, and
 * the seam between two blocks. Down it: its pad, how far apart two ports
 * stand, a line of what is written on it, the line that says what came out,
 * and the room between two rows. Between columns: the least room, and the
 * room each conduit takes there; and how wide a conduit turns. The layout
 * and the stylesheet both read them here, so a conduit ends where its port
 * is drawn.
 */
export const SCHEMATIC = { name: 100, tab: 50, out: 44, seam: 3, pad: 32, port: 17, line: 12, said: 15, between: 16, channel: 38, lane: 10, curve: 7 } as const;
