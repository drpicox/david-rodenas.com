import type { Cell } from "./Cell";
import { JavaRandom } from "./JavaRandom";
import type { Maze } from "./Maze";
import { OPEN } from "./OPEN";

/** The Java's fifth bit: a sphere floats in this room. It also counts as the room being dug. */
const SPHERE = 0x10;

/** The three orders `generar` tried the neighbours in: one of three, not one of the twenty-four. */
const ORDERS = [
  ["N", "E", "W", "S"],
  ["W", "S", "E", "N"],
  ["S", "E", "W", "N"],
] as const;

const STEP = { N: [0, 1, "S"], S: [0, -1, "N"], E: [1, 0, "W"], W: [-1, 0, "E"] } as const;

/**
 * `LaberintoSimple` of 20 May 2001, move for move and draw for draw: a
 * depth-first dig from the corner, and in one room in ten a sphere to a room
 * picked anywhere, dug from there if nobody has dug it yet. With `spheres`
 * off it is the version of 13 May, which never rolled for one.
 */
export function growMaze(width: number, height: number, seed: number, { spheres = true } = {}): Maze {
  const random = new JavaRandom(seed);
  const cells = new Array<number>(width * height).fill(0);
  const links = new Map<number, number>();
  const path: Cell[] = [];
  const at = (x: number, y: number) => x + y * width;

  function dig(x: number, y: number): void {
    path.push({ x, y });
    if (spheres && random.nextInt(10) < 1) jump(x, y);
    for (const side of ORDERS[random.nextInt(3)]!) {
      const [dx, dy, back] = STEP[side];
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || cells[at(nx, ny)] !== 0) continue;
      cells[at(x, y)]! |= OPEN[side];
      cells[at(nx, ny)] = OPEN[back];
      dig(nx, ny);
      path.push({ x, y });
    }
  }

  function jump(x: number, y: number): void {
    const tx = random.nextInt(width);
    const ty = random.nextInt(height);
    if (cells[at(tx, ty)] !== 0) return;
    cells[at(x, y)]! |= SPHERE;
    cells[at(tx, ty)] = SPHERE;
    // A room that already had a sphere has it pointed somewhere new, and the old one pointing here dies.
    links.set(at(x, y), at(tx, ty));
    links.set(at(tx, ty), at(x, y));
    dig(tx, ty);
    path.push({ x, y });
  }

  dig(0, 0);
  // `main` opened the way in and the way out after the dig.
  cells[at(0, 0)]! |= OPEN.S;
  cells[at(width - 1, height - 1)]! |= OPEN.N;
  return { width, height, cells, links, path };
}
