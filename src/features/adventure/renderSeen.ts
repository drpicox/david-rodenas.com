import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { ADVENTURE_ICONS } from "./ADVENTURE_ICONS";
import type { Direction, Seen } from "./Adventure";
import { LIFE } from "./LIFE";

/** The directions as they are said to the player. */
const DIRECTION_NAMES: Readonly<Record<Direction, string>> = { norte: "north", sur: "south", este: "east", oeste: "west" };

/** What the player carries, as the pictures of it, and the life left as a row of hearts. */
function gear(seen: Seen): string {
  const held = (["weapon", "shield", "key"] as const).flatMap((kind) => (seen[kind] ? [`<span class="held">${ADVENTURE_ICONS[kind]}${escapeHtml(seen[kind] ?? "")}</span>`] : []));
  const hearts = Array.from({ length: LIFE }, (_, index) => `<span class="heart${index < seen.life ? " full" : ""}"></span>`).join("");
  return `<p class="gear"><span class="hearts" title="${seen.life} of ${LIFE} life">${hearts}</span>${held.join("")}</p>`;
}

/**
 * What the game printed at every prompt, in its own order and its own words:
 * the room, what is in it, the exits, and the player's line. The pictures
 * beside them are this page's, and say nothing the words do not.
 */
export function renderSeen(seen: Seen): string {
  const exits = seen.exits.map(({ direction, locked }) => `${DIRECTION_NAMES[direction]}${locked ? " (locked)" : ""}`);
  const held = [seen.weapon && `weapon:${seen.weapon}`, seen.shield && `shield:${seen.shield}`, seen.key && `key:${seen.key}`].filter(Boolean).join(" ");
  return (
    `<div class="seen"><h4>===== ${escapeHtml(seen.name)} =====</h4><p>${escapeHtml(seen.text).replace(/\n/g, "<br>")}</p>` +
    (seen.monster ? `<p class="monster">${ADVENTURE_ICONS.monster}There is a monster here: ${escapeHtml(seen.monster)}</p>` : "") +
    (seen.item ? `<p class="item">${ADVENTURE_ICONS[seen.itemKind ?? "weapon"]}There is: ${escapeHtml(seen.item)}</p>` : "") +
    `<p class="exits">Exits: ${exits.length ? exits.join(", ") : "none"}.</p>` +
    gear(seen) +
    `<p class="status">(${seen.at[1]},${seen.at[0]})| ${escapeHtml(held)} ${seen.life}&gt;</p></div>`
  );
}
