import { escapeHtml } from "../../platform/markdown/escapeHtml";
import type { Direction, Seen } from "./Adventure";

/** The directions as they are said to the player. */
const DIRECTION_NAMES: Readonly<Record<Direction, string>> = { norte: "north", sur: "south", este: "east", oeste: "west" };

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
