/**
 * The sizes a schematic is drawn at, in its own units: how wide a module is
 * and how high its pad, how far apart the rows stand, the least room between
 * two columns and the room each conduit takes there, how far apart conduits
 * meet a module's end, and how wide a conduit turns. The layout and the
 * stylesheet both read them here, so a conduit ends where its module is drawn.
 */
export const SCHEMATIC = { module: 180, pad: 32, row: 70, channel: 40, lane: 10, port: 7, curve: 7 } as const;
