/** The level a box stands at: the frame, the features, or the files at the top of the source, the composition root among them. */
export function bandOf(box: string): string {
  return box.includes("/") ? (box.split("/")[0] ?? box) : "src";
}
