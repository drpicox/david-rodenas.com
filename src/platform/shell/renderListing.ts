import type { Page } from "../content/Page";
import { escapeHtml } from "../markdown/escapeHtml";

/**
 * What a directory holds, as a table: the name first, in the type of the
 * machine, and then what the name stands for — its title, and what it is.
 * A page ends with it, and `ls -t` prints it at the prompt.
 */
export function renderListing(children: readonly Page[]): string {
  const items = children
    .map(
      (child) =>
        `<li><a class="entry" href="${child.route}"><code>${escapeHtml(child.name)}${child.link ? "@" : "/"}</code>` +
        `<span class="title">${escapeHtml(child.title)}</span>` +
        (child.summary ? `<span class="summary">${escapeHtml(child.summary)}</span>` : "") +
        `</a></li>`,
    )
    .join("");
  return `<ul class="listing">${items}</ul>`;
}
