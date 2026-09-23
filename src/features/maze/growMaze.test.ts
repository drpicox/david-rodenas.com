import { describe, expect, it } from "vitest";
import { growMaze } from "./growMaze";
import type { Maze } from "./Maze";
import { OPEN } from "./OPEN";

/** A room as the VRML file drew it: the sides with no wall, and a star if a sphere floats in it. */
function room(maze: Maze, x: number, y: number): string {
  const cell = maze.cells[x + y * maze.width]!;
  const sides = (["N", "S", "E", "W"] as const).filter((side) => cell & OPEN[side]).join("");
  return sides + (maze.links.has(x + y * maze.width) ? "*" : "");
}

function rows(maze: Maze): string[] {
  return Array.from({ length: maze.height }, (_, row) => {
    const y = maze.height - 1 - row;
    return Array.from({ length: maze.width }, (_, x) => room(maze, x, y).padEnd(5)).join(" ").trimEnd();
  });
}

describe("the maze generator of May 2001", () => {
  it("grows from seed 543, seven by seven, the maze kept in test.wrl on 20 May 2001, wall for wall", () => {
    // Read off the file's walls, north at the top; the entrance is the bottom-left's south, the exit the top-right's north.
    expect(rows(growMaze(7, 7, 543))).toEqual([
      "S     SE    EW    EW    SEW   EW    NW",
      "NS    NE    EW    SW    NE    EW    SW",
      "NSE   SW    E*    NW    S     SE    NSW",
      "NS    NS*   SE    EW    NW    NS    N",
      "N     NS    NE    EW    SW    NE    SW",
      "E*    NW    E*    EW    NW    SE    NSW",
      "SE    EW    EW    EW    EW    NW    N",
    ]);
  });

  it("pairs the spheres as the file's anchors do: each one takes you to the other", () => {
    const maze = growMaze(7, 7, 543);
    const at = (x: number, y: number) => x + y * 7;
    expect(maze.links.get(at(0, 1))).toBe(at(2, 4));
    expect(maze.links.get(at(2, 4))).toBe(at(0, 1));
    expect(maze.links.get(at(1, 3))).toBe(at(2, 1));
    expect(maze.links.get(at(2, 1))).toBe(at(1, 3));
  });

  it("keeps the route the camera took, which is the order the rooms were dug in, returns and jumps included", () => {
    // Printed by the 2001 class itself, today, from its recorridoDFS.
    const java =
      "0 0, 1 0, 2 0, 3 0, 4 0, 5 0, 5 1, 6 1, 6 0, 6 1, 6 2, 5 2, 5 3, 5 4, 6 4, 6 5, 5 5, 4 5, 4 6, 3 6, 2 6, 1 6, 1 5, 2 5, 3 5, 3 4, 2 4, 0 1, 1 1, 1 2, 1 3, 2 1, 3 1, 4 1, 4 2, 3 2, 2 2, 2 3, 3 3, 4 3, 4 4, 4 3, 3 3, 2 3, 2 2, 3 2, 4 2, 4 1, 3 1, 2 1, 1 3, 1 4, 0 4, 0 3, 0 2, 0 3, 0 4, 0 5, 0 6, 0 5, 0 4, 1 4, 1 3, 1 2, 1 1, 0 1, 2 4, 3 4, 3 5, 2 5, 1 5, 1 6, 2 6, 3 6, 4 6, 5 6, 6 6, 5 6, 4 6, 4 5, 5 5, 6 5, 6 4, 6 3, 6 4, 5 4, 5 3, 5 2, 6 2, 6 1, 5 1, 5 0, 4 0, 3 0, 2 0, 1 0, 0 0";
    expect(growMaze(7, 7, 543).path.map(({ x, y }) => `${x} ${y}`).join(", ")).toBe(java);
  });

  it("without the spheres, as on 13 May, digs every room once: one way between any two", () => {
    const maze = growMaze(12, 9, 5443, { spheres: false });
    expect(maze.links.size).toBe(0);
    const doors = maze.cells.reduce((sum, cell) => sum + (cell & OPEN.N ? 1 : 0) + (cell & OPEN.E ? 1 : 0), 0);
    // A tree over 108 rooms has 107 doors; the exit's north is the one door to the outside.
    expect(doors).toBe(12 * 9 - 1 + 1);
    expect(maze.path).toHaveLength(2 * 12 * 9 - 1);
  });

  it("leaves a sphere leading nowhere when the room it leads to grows a sphere of its own", () => {
    // Seed 0 is one of the 133 in the first thousand seven-by-sevens where the Java does this.
    const maze = growMaze(7, 7, 0);
    const dead = [...maze.links].filter(([from, to]) => maze.links.get(to) !== from);
    expect(dead).toHaveLength(1);
  });
});
