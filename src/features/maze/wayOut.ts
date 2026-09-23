import type { Cell } from "./Cell";
import type { Maze } from "./Maze";
import { OPEN } from "./OPEN";

/**
 * The shortest walk from the way in to the way out, through doors and live
 * spheres, or null when a dead sphere cut the way out off. Breadth first,
 * because with spheres there can be more than one way and the report
 * promised the short one needs no walls crossed.
 */
export function wayOut(maze: Maze): Cell[] | null {
  const { width, height, cells, links } = maze;
  const exit = width * height - 1;
  const cameFrom = new Map<number, number>([[0, -1]]);
  const queue = [0];
  for (let head = 0; head < queue.length; head += 1) {
    const room = queue[head]!;
    if (room === exit) break;
    const x = room % width;
    const y = Math.floor(room / width);
    const cell = cells[room]!;
    const next: number[] = [];
    if (cell & OPEN.E && x + 1 < width) next.push(room + 1);
    if (cell & OPEN.W && x > 0) next.push(room - 1);
    if (cell & OPEN.N && y + 1 < height) next.push(room + width);
    if (cell & OPEN.S && y > 0) next.push(room - width);
    const far = links.get(room);
    if (far !== undefined && links.get(far) === room) next.push(far);
    for (const to of next) {
      if (cameFrom.has(to)) continue;
      cameFrom.set(to, room);
      queue.push(to);
    }
  }
  if (!cameFrom.has(exit)) return null;
  const way: Cell[] = [];
  for (let room = exit; room !== -1; room = cameFrom.get(room)!) way.unshift({ x: room % width, y: Math.floor(room / width) });
  return way;
}
