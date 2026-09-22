import { escapeHtml } from "../../markdown/escapeHtml";
import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

/** Enough lines to find what was looked for, and not so many that the paper is buried. */
const MOST = 40;

/** The markup a line is written in, taken out, so that a hit reads as the sentence it is in. */
const plain = (line: string) => line.replace(/\]\([^)]*\)/g, "]").replace(/[#*_`>\[\]]/g, "").trim();

/**
 * The lines of every page that say a word: `grep word [path]`. Case does not
 * matter, because a reader searching a site is looking for a thing and not a
 * spelling. Each hit is the page's path, the line's number and the line,
 * and the path is a way to go there.
 */
export const grep: Command = {
  name: "grep",
  usage: "grep <word> [path]",
  description: "the lines of every page under a directory that say a word",
  run({ site, cwd }, [word, path = "."]) {
    if (!word) return { text: "grep: usage: grep <word> [path]", error: true };
    const route = resolvePath(cwd, path);
    if (!site.at(route)) return { text: `grep: ${path}: no such directory`, error: true };
    const wanted = word.toLowerCase();

    const hits = site.pages
      .filter((page) => page.route.startsWith(route))
      .flatMap((page) =>
        page.body
          .split("\n")
          .map((line, index) => ({ page, number: index + 1, line: plain(line) }))
          .filter(({ line }) => line.toLowerCase().includes(wanted)),
      );
    if (hits.length === 0) return { text: `grep: no page under ${path} says "${word}"` };

    const shown = hits.slice(0, MOST);
    const more = hits.length > MOST ? [`… and ${hits.length - MOST} more. Give grep a directory to look in.`] : [];
    const mark = (line: string) => escapeHtml(line).replace(new RegExp(escapeHtml(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), (found) => `<mark>${found}</mark>`);
    return {
      text: [...shown.map(({ page, number, line }) => `${page.route}:${number}: ${line}`), ...more].join("\n"),
      html: `<pre class="listing wrap">${[
        ...shown.map(({ page, number, line }) => `<span class="line"><a href="${escapeHtml(page.route)}">${escapeHtml(page.route)}</a>:${number}: <span class="hint">${mark(line)}</span></span>`),
        ...more.map((line) => `<span class="line">${escapeHtml(line)}</span>`),
      ].join("")}</pre>`,
    };
  },
};
