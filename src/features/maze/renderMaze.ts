import type { Cell } from "./Cell";
import type { Maze } from "./Maze";
import { OPEN } from "./OPEN";

/** A room's side, in the drawing's units. */
const SIDE = 10;
const MARGIN = 4;

interface Overlay {
  /** How many steps of the camera's route to draw. */
  readonly trail?: number;
  /** The way out, if one is to be shown. */
  readonly way?: readonly Cell[] | null;
}

/**
 * The maze from above, as plain SVG, the same in node and in the browser:
 * north at the top, the way in at the bottom left, the way out at the top
 * right. A sphere is a circle with a letter, and its pair has the same one.
 */
export function renderMaze(maze: Maze, { trail, way }: Overlay = {}): string {
  const { width, height, cells, links } = maze;
  const px = (x: number) => MARGIN + x * SIDE;
  const py = (y: number) => MARGIN + (height - 1 - y) * SIDE;
  const centre = ({ x, y }: Cell): [number, number] => [px(x) + SIDE / 2, py(y) + SIDE / 2];

  const walls: string[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[x + y * width]!;
      if (!(cell & OPEN.S)) walls.push(`M${px(x)} ${py(y) + SIDE}h${SIDE}`);
      if (!(cell & OPEN.W)) walls.push(`M${px(x)} ${py(y)}v${SIDE}`);
      if (y === height - 1 && !(cell & OPEN.N)) walls.push(`M${px(x)} ${py(y)}h${SIDE}`);
      if (x === width - 1 && !(cell & OPEN.E)) walls.push(`M${px(x) + SIDE} ${py(y)}v${SIDE}`);
    }
  }

  const letters = new Map<number, string>();
  let dead = 0;
  const spheres = [...links].map(([from, to]) => {
    const live = links.get(to) === from;
    if (!live) dead += 1;
    else if (!letters.has(from)) {
      const letter = String.fromCharCode(97 + (letters.size / 2) % 26);
      letters.set(from, letter).set(to, letter);
    }
    const [cx, cy] = centre({ x: from % width, y: Math.floor(from / width) });
    return (
      `<circle class="sphere${live ? "" : " dead"}" cx="${cx}" cy="${cy}" r="${SIDE * 0.3}"/>` +
      `<text class="letter" x="${cx}" y="${cy}">${live ? letters.get(from) : "×"}</text>`
    );
  });

  /** A line through rooms, lifted where the route jumps through a sphere instead of walking. */
  const line = (rooms: readonly Cell[]) =>
    rooms.map((room, i) => {
      const before = rooms[i - 1];
      const walked = before && Math.abs(room.x - before.x) + Math.abs(room.y - before.y) === 1;
      return `${walked ? "L" : "M"}${centre(room).join(" ")}`;
    }).join("");

  const overlays: string[] = [];
  if (way) overlays.push(`<path class="way" d="${line(way)}"/>`);
  if (trail !== undefined && trail > 0) {
    const walked = maze.path.slice(0, trail);
    const [wx, wy] = centre(walked[walked.length - 1]!);
    overlays.push(`<path class="trail" d="${line(walked)}"/>`, `<circle class="walker" cx="${wx}" cy="${wy}" r="${SIDE * 0.22}"/>`);
  }

  const described =
    `A ${width} by ${height} maze with ${links.size} sphere${links.size === 1 ? "" : "s"}` + (dead ? `, ${dead} leading nowhere` : "") + ".";
  return (
    `<svg class="maze" role="img" aria-label="${described}" viewBox="0 0 ${width * SIDE + 2 * MARGIN} ${height * SIDE + 2 * MARGIN}">` +
    overlays.join("") +
    `<path class="walls" d="${walls.join("")}"/>` +
    spheres.join("") +
    `</svg>`
  );
}
