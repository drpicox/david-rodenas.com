import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { escapeHtml } from "../markdown/escapeHtml";
import { renderMarkdown } from "../markdown/renderMarkdown";
import { promptPath } from "../shell/promptPath";

/** A line as it would stand in the session: the prompt it was typed at, and the command. */
function ran(prompt: string, command: string): string {
  return `<p class="ran"><span class="ps1">${escapeHtml(prompt)} $</span> ${escapeHtml(command)}</p>`;
}

/**
 * A directory prints what it holds, as `ls` would at its own prompt: the
 * name first, in the type of the machine, and then what the name stands for.
 * A page prints nothing here. Nor does the root: its directory is the
 * navigation.
 */
function listing(site: Site, page: Page): string {
  if (page.parent === null) return "";
  const children = site.childrenOf(page.route);
  if (children.length === 0) return "";
  const items = children
    .map(
      (child) =>
        `<li><a class="entry" href="${child.route}"><code>${escapeHtml(child.name)}/</code>` +
        `<span class="title">${escapeHtml(child.title)}</span>` +
        (child.summary ? `<span class="summary">${escapeHtml(child.summary)}</span>` : "") +
        `</a></li>`,
    )
    .join("");
  return `${ran(promptPath(page.route), "ls")}\n<ul class="listing">${items}</ul>`;
}

/**
 * The command that printed this page. Now that there is a shell, it would:
 * every directory holds one file, README.md, and reading it is what a page is.
 */
function trail(site: Site, page: Page): string {
  const path = site
    .trailTo(page.route)
    .slice(1)
    .map((step) => step.name)
    .join("/");
  return ran("~", path ? `cd ${path} && cat README.md` : "cat README.md");
}

/**
 * The inside of `<main>`, on its own, so that the build can wrap it in a
 * document and the browser can swap it into one that is already open.
 */
export function renderMain(site: Site, page: Page): string {
  return `${trail(site, page)}\n${renderMarkdown(page.body)}\n${listing(site, page)}`;
}
