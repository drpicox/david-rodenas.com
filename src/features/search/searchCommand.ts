import type { Command } from "../../platform/command/Command";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { foldedOf } from "./foldedOf";
import { markedOf } from "./markedOf";
import { pagesFound } from "./pagesFound";

/** Enough pages to choose from at a prompt; another word is the way to the rest. */
const MOST = 10;

/**
 * `search words…`: the pages that say every word, whatever its case and
 * accents, the best answer first — as `find` lists them, a path and a title
 * — each with the line of it that says the most of them, the words marked.
 * Where `grep` gives every line, this gives every page once.
 */
export const searchCommand: Command = {
  name: "search",
  usage: "search <words>",
  description: "the pages that say some words, the best first, each with a line that says them",
  run({ site }, words) {
    if (words.length === 0) return { text: "search: usage: search <words>", error: true };
    const query = words.join(" ");
    const found = pagesFound(site, query);
    if (found.length === 0) return { text: `search: no page says "${query}"` };

    const folded = foldedOf(query).split(/\s+/).filter(Boolean);
    const shown = found.slice(0, MOST);
    const more = found.length > MOST ? [`… and ${found.length - MOST} more. Another word narrows it.`] : [];
    const width = Math.max(...shown.map(({ route }) => route.length));
    return {
      text: [...shown.flatMap(({ route, title, line }) => [`${route.padEnd(width)}  # ${title}`, `  ${line}`]), ...more].join("\n"),
      html: `<pre class="listing wrap found">${[
        ...shown.map(
          ({ route, title, line }) =>
            `<span class="line"><a href="${escapeHtml(route)}">${escapeHtml(route)}</a>${" ".repeat(width - route.length)}<span class="hint">  # ${escapeHtml(title)}</span></span>` +
            `<span class="line said">  ${markedOf(line, folded)}</span>`,
        ),
        ...more.map((line) => `<span class="line">${escapeHtml(line)}</span>`),
      ].join("")}</pre>`,
    };
  },
};
