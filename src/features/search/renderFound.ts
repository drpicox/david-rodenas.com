import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { markedOf } from "./markedOf";
import type { Found } from "./pagesFound";

/** Enough to choose from as one types; another word is the way to the rest. */
const MOST = 8;

/** A page as `ls` would name it from the root: README.md for the home, a path for the rest. */
const pathOf = (route: string) => (route === "/" ? "README.md" : route.slice(1));

/**
 * The pages found, drawn the two ways a search shows them as one types: as
 * `lines`, a listing the header prints where `ls` printed the directories —
 * a path, what it is after a #, the line that says the words — or as `cards`,
 * each a block to follow whole, its section above its title. The words are
 * marked in each line, and what is past the first few is counted.
 */
export function renderFound(found: readonly Found[], words: readonly string[], look: "lines" | "cards", most = MOST): string {
  if (found.length === 0) return '<p class="none">No page says that.</p>';
  const shown = found.slice(0, most);
  const items =
    look === "lines"
      ? `<ol class="found lines">${shown
          .map(({ route, title, line }) => `<li><a href="${escapeHtml(route)}">${escapeHtml(pathOf(route))}</a><span class="hint"> # ${escapeHtml(title)}</span><span class="said">${markedOf(line, words)}</span></li>`)
          .join("")}</ol>`
      : `<div class="found cards">${shown
          .map(({ route, title, section, line }) => `<a class="card" href="${escapeHtml(route)}"><span class="where">${escapeHtml(section || "home")}</span><strong>${escapeHtml(title)}</strong><span class="said">${markedOf(line, words)}</span></a>`)
          .join("")}</div>`;
  const more = found.length - shown.length;
  return more > 0 ? `${items}<p class="more">${more} more. Another word narrows it.</p>` : items;
}
