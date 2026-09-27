import type { Adventure } from "./Adventure";
import { renderMap } from "./renderMap";
import { renderSeen } from "./renderSeen";

/** The whole figure: the map beside what the player sees. */
export function renderAdventure(game: Adventure): string {
  return `<div class="adventure">${renderMap(game.charted(), game.look().at)}${renderSeen(game.look())}</div>`;
}
