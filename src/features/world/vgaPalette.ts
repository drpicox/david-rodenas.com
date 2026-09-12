/**
 * The sixteen colours of a VGA card in text mode, in the order the card
 * numbered them: the eight dark ones, then the same eight bright. Brown is
 * where dark yellow would be, because the CGA before it made it so and every
 * card after kept the habit.
 */
export const VGA_PALETTE: readonly string[] = [
  "#000000",
  "#0000aa",
  "#00aa00",
  "#00aaaa",
  "#aa0000",
  "#aa00aa",
  "#aa5500",
  "#aaaaaa",
  "#555555",
  "#5555ff",
  "#55ff55",
  "#55ffff",
  "#ff5555",
  "#ff55ff",
  "#ffff55",
  "#ffffff",
];
