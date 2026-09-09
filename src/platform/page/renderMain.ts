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

/** A command as it was typed, and the prompt it was typed at. */
export interface Ran {
  readonly prompt: string;
  readonly command: string;
}

/**
 * The command that would have got you here. Now that there is a shell, it
 * would. At home there is nowhere to go, only the page to print.
 */
function wouldHaveRun(site: Site, page: Page): Ran {
  const steps = site.trailTo(page.route);
  const path = steps
    .slice(1)
    .map((step) => step.name)
    .join("/");
  return { prompt: "~ $", command: steps.length <= 1 ? "cat README.md" : `cd ${path} && cat *` };
}

function trail(ran: Ran): string {
  return `<p class="ran"><span class="ps1">${escapeHtml(ran.prompt)}</span> ${escapeHtml(ran.command)}</p>`;
}

/**
 * The inside of `<main>`, on its own, so that the build can wrap it in a
 * document and the browser can swap it into one that is already open. The
 * page opens with the command that printed it: the one that would have, or,
 * when the shell shows a page, the one that did.
 */
export function renderMain(site: Site, page: Page, ran: Ran = wouldHaveRun(site, page)): string {
  return `${trail(ran)}\n${renderMarkdown(page.body)}\n${listing(site, page)}`;
}
