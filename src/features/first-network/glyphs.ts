const drawn = (rows: string) => [...rows.replace(/\s/g, "")].map((cell) => (cell === "#" ? 1 : 0));

/**
 * The letters the network can be taught, on five by five cells. Some are
 * chosen to be told apart easily and some — O, C and D — to be confused.
 */
export const glyphs: Readonly<Record<string, readonly number[]>> = {
  A: drawn(".###. #...# ##### #...# #...#"),
  B: drawn("####. #...# ####. #...# ####."),
  C: drawn(".#### #.... #.... #.... .####"),
  D: drawn("####. #...# #...# #...# ####."),
  E: drawn("##### #.... ####. #.... #####"),
  H: drawn("#...# #...# ##### #...# #...#"),
  O: drawn(".###. #...# #...# #...# .###."),
  T: drawn("##### ..#.. ..#.. ..#.. ..#.."),
  X: drawn("#...# .#.#. ..#.. .#.#. #...#"),
};
