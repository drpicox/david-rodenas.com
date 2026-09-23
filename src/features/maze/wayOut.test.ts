import { describe, expect, it } from "vitest";
import type { Cell } from "./Cell";
import { growMaze } from "./growMaze";
import type { Maze } from "./Maze";
import { OPEN } from "./OPEN";
import { wayOut } from "./wayOut";

/** Can a walker go from one room to the next: through a door, or by touching a sphere that leads there and back? */
function passable(maze: Maze, a: Cell, b: Cell): boolean {
  const from = a.x + a.y * maze.width;
  const to = b.x + b.y * maze.width;
  if (maze.links.get(from) === to && maze.links.get(to) === from) return true;
  const cell = maze.cells[from]!;
  if (b.x === a.x + 1 && b.y === a.y) return (cell & OPEN.E) !== 0;
  if (b.x === a.x - 1 && b.y === a.y) return (cell & OPEN.W) !== 0;
  if (b.y === a.y + 1 && b.x === a.x) return (cell & OPEN.N) !== 0;
  if (b.y === a.y - 1 && b.x === a.x) return (cell & OPEN.S) !== 0;
  return false;
}

describe("the way out", () => {
  it("goes from the way in to the way out of the maze of 2001, a door or a sphere at every step", () => {
    const maze = growMaze(7, 7, 543);
    const way = wayOut(maze)!;
    expect(way[0]).toEqual({ x: 0, y: 0 });
    expect(way[way.length - 1]).toEqual({ x: 6, y: 6 });
    for (let i = 1; i < way.length; i += 1) expect(passable(maze, way[i - 1]!, way[i]!)).toBe(true);
  });

  it("is the shortest there is: never longer than walking the camera's whole route", () => {
    const maze = growMaze(7, 7, 543);
    expect(wayOut(maze)!.length).toBeLessThan(maze.path.length);
  });

  it("does not use a dead sphere, and is missing when the only way was through one", () => {
    // In the first two hundred seeds, count the mazes the Java left with no way out.
    const lost = Array.from({ length: 200 }, (_, seed) => growMaze(7, 7, seed)).filter((maze) => wayOut(maze) === null);
    expect(lost.length).toBeGreaterThan(0);
    for (const maze of lost) expect([...maze.links].some(([from, to]) => maze.links.get(to) !== from)).toBe(true);
  });
});
