import { pixelIcon } from "./pixelIcon";

const COLOURS = {
  k: "var(--ink)",
  a: "var(--accent)",
  m: "#aeb8c4",
  g: "#d4a017",
  b: "#8a5a2b",
  r: "#c0392b",
  w: "#f1f1ee",
  l: "#3f9b4b",
};

/**
 * What the map and the room show for each thing the game holds, and for the
 * player: drawn for this page, eight pixels a side, in the spirit of the
 * terminal the game was written for. The game itself never had pictures;
 * these are only a way of seeing what its words already say.
 */
export const ADVENTURE_ICONS = {
  weapon: pixelIcon(["......mm", ".....mmm", "....mmm.", "g..mmm..", ".gmmm...", "..bg....", ".b..g...", "b......."], COLOURS),
  shield: pixelIcon([".kkkkkk.", "kmmrrmmk", "kmmrrmmk", "krrrrrrk", "kmmrrmmk", ".kmrrmk.", "..kmmk..", "...kk..."], COLOURS),
  food: pixelIcon(["....b...", "...b.ll.", ".rrbrr..", "rrrrrrr.", "rwrrrrr.", "rrrrrrr.", ".rrrrr..", "..r.r..."], COLOURS),
  key: pixelIcon(["........", ".ggg....", "g...g...", "g...gggg", "g...g.g.", ".ggg..gg", "........", "........"], COLOURS),
  monster: pixelIcon(["........", "...rr...", "..rrrr..", ".rwrrwr.", ".rkrrkr.", "rrrrrrrr", "rrkkkkrr", "r.r..r.r"], COLOURS),
  player: pixelIcon(["...kk...", "..kkkk..", "...kk...", ".aaaaaa.", "a.aaaa.a", "..aaaa..", "..a..a..", ".kk..kk."], COLOURS),
} as const;
