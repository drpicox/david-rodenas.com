import type { Maze } from "./Maze";
import { wayOut } from "./wayOut";

/** The line under the drawing: how long the way out is, and how many of its steps are jumps. */
export function describeWay(maze: Maze): string {
  const way = wayOut(maze);
  if (!way) return "There is no way out: the only one ran through a sphere that leads nowhere.";
  const jumps = way.slice(1).filter((room, i) => Math.abs(room.x - way[i]!.x) + Math.abs(room.y - way[i]!.y) > 1).length;
  const touched = jumps === 0 ? "touches no sphere" : `jumps through ${jumps === 1 ? "one sphere" : `${jumps} spheres`}`;
  return `The way out is ${way.length} rooms long, and ${touched}.`;
}
