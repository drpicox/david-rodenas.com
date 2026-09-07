import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { escapeHtml } from "../markdown/escapeHtml";
import { renderMarkdown } from "../markdown/renderMarkdown";

/** A directory prints what it holds; a page prints nothing here. Nor does the root: its directory is the navigation. */
function listing(site: Site, page: Page): string {
  if (page.parent === null) return "";
  const children = site.childrenOf(page.route);
  if (children.length === 0) return "";
  const items = children
    .map(
      (child) =>
        `<li><a href="${child.route}">${escapeHtml(child.title)}</a>` +
        (child.summary ? ` <span class="summary">${escapeHtml(child.summary)}</span>` : "") +
        `</li>`,
    )
    .join("");
  return `<ul class="listing">${items}</ul>`;
}

/** The command that would have got you here. Now that there is a shell, it would. */
function trail(site: Site, page: Page): string {
  const steps = site.trailTo(page.route);
  if (steps.length <= 1) return "";
  const path = steps
    .slice(1)
    .map((step) => step.name)
    .join("/");
  return `<p class="ran"><span class="ps1">~ $</span> cd ${escapeHtml(path)} &amp;&amp; cat *</p>`;
}

/**
 * The inside of `<main>`, on its own, so that the build can wrap it in a
 * document and the browser can swap it into one that is already open.
 */
export function renderMain(site: Site, page: Page): string {
  return `${trail(site, page)}\n${renderMarkdown(page.body)}\n${listing(site, page)}`;
}
