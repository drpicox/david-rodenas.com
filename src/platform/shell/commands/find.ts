import type { Page } from "../../content/Page";
import { escapeHtml } from "../../markdown/escapeHtml";
import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

/**
 * Every page under a directory, as its path, the way `find` prints a tree —
 * and with a word, only the pages whose path or title contains it. There
 * are no files here but pages, so there is nothing else to find.
 */
export const find: Command = {
  name: "find",
  usage: "find [path] [word]",
  description: "every page under a directory; with a word, only those it is in the name or title of",
  run({ site, cwd }, args) {
    const [first, second] = args;
    const pathGiven = first !== undefined && (first === "." || first.includes("/") || site.at(resolvePath(cwd, first)) !== undefined);
    const path = pathGiven ? (first ?? ".") : ".";
    const word = (pathGiven ? second : first)?.toLowerCase();
    const route = resolvePath(cwd, path);
    if (!site.at(route)) return { text: `find: ${path}: no such directory`, error: true };

    // The tree in the order a walk of it goes: a directory, then what it holds, in the author's order.
    // A link is not walked: the page it stands for is found where it is.
    const walk = (from: string): Page[] => site.childrenOf(from).filter((child) => !child.link).flatMap((child) => [child, ...walk(child.route)]);
    const under = [site.at(route) as Page, ...walk(route)];
    const found = under.filter((page) => !word || page.route.toLowerCase().includes(word) || page.title.toLowerCase().includes(word));
    if (found.length === 0) return { text: `find: nothing under ${path}${word ? ` with "${word}" in it` : ""}` };

    const width = Math.max(...found.map((page) => page.route.length));
    const pad = (page: Page) => " ".repeat(width - page.route.length);
    return {
      text: found.map((page) => `${page.route}${pad(page)}  # ${page.title}`).join("\n"),
      html: `<pre class="listing">${found
        .map((page) => `<span class="line"><a href="${escapeHtml(page.route)}">${escapeHtml(page.route)}</a>${pad(page)}<span class="hint">  # ${escapeHtml(page.title)}</span></span>`)
        .join("")}</pre>`,
    };
  },
};
