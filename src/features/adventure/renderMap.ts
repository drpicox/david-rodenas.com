import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { englishWorld } from "./englishWorld";

const SIZE = 8;

/**
 * The map, as the game never showed it: eight by eight, south at the bottom,
 * a room named once it has been stood in. It was drawn on squared paper
 * first so that it would read well, and typed in afterwards.
 */
export function renderMap(visited: ReadonlySet<string>, at: readonly [number, number]): string {
  const cells: string[] = [];
  for (let i = SIZE - 1; i >= 0; i -= 1) {
    for (let j = 0; j < SIZE; j += 1) {
      const where = `${i},${j}`;
      const room = englishWorld.rooms[where];
      const seen = visited.has(where);
      const here = at[0] === i && at[1] === j;
      const classes = ["cell", seen ? "seen" : "", here ? "here" : ""].filter(Boolean).join(" ");
      cells.push(`<span class="${classes}" title="${seen && room ? escapeHtml(room.name) : ""}">${seen && room ? escapeHtml(room.name) : ""}</span>`);
    }
  }
  return `<div class="map" role="img" aria-label="The map: ${visited.size} of ${SIZE * SIZE} rooms seen">${cells.join("")}</div>`;
}
