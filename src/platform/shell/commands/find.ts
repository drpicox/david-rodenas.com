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

    const under = site.pages.filter((page) => page.route.startsWith(route));
    const found = under.filter((page) => !word || page.route.toLowerCase().includes(word) || page.title.toLowerCase().includes(word));
    if (found.length === 0) return { text: `find: nothing under ${path}${word ? ` with "${word}" in it` : ""}` };

    return {
      text: found.map((page) => `${page.route}  # ${page.title}`).join("\n"),
      html: `<pre class="listing">${found
        .map((page) => `<span class="line"><a href="${escapeHtml(page.route)}">${escapeHtml(page.route)}</a><span class="hint">  # ${escapeHtml(page.title)}</span></span>`)
        .join("")}</pre>`,
    };
  },
};
