import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { DIRECTION_NAMES, type Adventure, type Seen } from "./Adventure";
import { rooms } from "./englishWorld";

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
      const room = rooms[where];
      const seen = visited.has(where);
      const here = at[0] === i && at[1] === j;
      const classes = ["cell", seen ? "seen" : "", here ? "here" : ""].filter(Boolean).join(" ");
      cells.push(`<span class="${classes}" title="${seen && room ? escapeHtml(room.name) : ""}">${seen && room ? escapeHtml(room.name) : ""}</span>`);
    }
  }
  return `<div class="map" role="img" aria-label="The map: ${visited.size} of ${SIZE * SIZE} rooms seen">${cells.join("")}</div>`;
}

/** What the game printed at every prompt, in its own order: the room, what is in it, the exits, and the player's line. */
export function renderSeen(seen: Seen): string {
  const exits = seen.exits.map(({ direction, locked }) => `${DIRECTION_NAMES[direction]}${locked ? " (locked)" : ""}`);
  const held = [seen.weapon && `weapon:${seen.weapon}`, seen.shield && `shield:${seen.shield}`, seen.key && `key:${seen.key}`].filter(Boolean).join(" ");
  return (
    `<div class="seen"><h4>===== ${escapeHtml(seen.name)} =====</h4><p>${escapeHtml(seen.text).replace(/\n/g, "<br>")}</p>` +
    (seen.monster ? `<p class="monster">There is a monster here: ${escapeHtml(seen.monster)}</p>` : "") +
    (seen.item ? `<p class="item">There is: ${escapeHtml(seen.item)}</p>` : "") +
    `<p class="exits">Exits: ${exits.length ? exits.join(", ") : "none"}.</p>` +
    `<p class="status">(${seen.at[1]},${seen.at[0]})| ${escapeHtml(held)} ${seen.life}&gt;</p></div>`
  );
}

/** The whole figure: the map beside what the player sees. */
export function renderAdventure(game: Adventure): string {
  return `<div class="adventure">${renderMap(game.visited, game.look().at)}${renderSeen(game.look())}</div>`;
}
