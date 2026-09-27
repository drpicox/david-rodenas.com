import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { ADVENTURE_ICONS } from "./ADVENTURE_ICONS";
import type { Charted } from "./Charted";

const SIZE = 8;
const SIDES = ["n", "s", "e", "w"] as const;

/**
 * The map, as the game never showed it: eight by eight, south at the bottom,
 * each room stood in drawn as a room — walled where there is no way out, a
 * door marked where it wants a key, and what is in it now — and the rest fog.
 * It was drawn on squared paper first so that it would read well, and typed
 * in afterwards.
 */
export function renderMap(charted: readonly Charted[], at: readonly [number, number]): string {
  const known = new Map(charted.map((room) => [room.where, room]));
  const cells: string[] = [];
  for (let i = SIZE - 1; i >= 0; i -= 1) {
    for (let j = 0; j < SIZE; j += 1) {
      const where = `${i},${j}`;
      const room = known.get(where);
      const here = at[0] === i && at[1] === j;
      if (!room) {
        cells.push(`<span class="cell" data-where="${where}"><span></span></span>`);
        continue;
      }
      const sides = SIDES.flatMap((side, index) => {
        const exit = room.exits[index] ?? -1;
        return exit < 0 ? [`wall-${side}`] : exit > 0 ? [`door-${side}`] : [];
      });
      const classes = ["cell", "seen", here ? "here" : "", ...sides].filter(Boolean).join(" ");
      const thing = room.holds ? `<span class="thing${room.holds.kind === "monster" ? " monster" : ""}" title="${escapeHtml(room.holds.name)}">${ADVENTURE_ICONS[room.holds.kind]}</span>` : "";
      const player = here ? `<span class="player">${ADVENTURE_ICONS.player}</span>` : "";
      cells.push(`<span class="${classes}" data-where="${where}" title="${escapeHtml(room.name)}"><span class="room">${escapeHtml(room.name)}</span>${thing}${player}</span>`);
    }
  }
  return `<div class="map" role="img" aria-label="The map: ${charted.length} of ${SIZE * SIZE} rooms seen">${cells.join("")}</div>`;
}
