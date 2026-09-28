import { boxOf } from "./boxOf";
import type { Life } from "./Life";

/** The row of the picture of changes a file's whole life is drawn in: the box it stands in now, or none if it is gone. */
export function matrixRowOf(life: Life): string | null {
  return life.went === undefined ? boxOf(life.path) : null;
}
