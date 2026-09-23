import type { Still } from "../../platform/plugin/Feature";
import { describeWay } from "./describeWay";
import { FIRST } from "./FIRST";
import { growMaze } from "./growMaze";
import { renderMaze } from "./renderMaze";

/** The maze of 20 May 2001, as the browser will also open on it. */
export const mazeStill: Still = () => {
  const maze = growMaze(FIRST.size, FIRST.size, FIRST.seed);
  return `<div class="maze-app"><div class="figure">${renderMaze(maze)}</div><p class="status">${describeWay(maze)}</p></div>`;
};
