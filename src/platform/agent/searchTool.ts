import type { Page } from "../content/Page";
import { plainLineOf } from "../markdown/plainLineOf";
import type { AgentTool } from "../plugin/AgentTool";
import { routeAsked } from "./routeAsked";

/** Enough pages to choose from; an agent that wants more can narrow where it looks. */
const MOST_PAGES = 20;
/** Enough lines to tell why a page was found, not to read it: read does that. */
const MOST_LINES = 3;
/** The summary names a few; the data lists more. */
const MOST_NAMED = 5;

const says = (text: string, words: readonly string[]) => words.every((word) => text.toLowerCase().includes(word));

function saidIn(titles: readonly string[]): string {
  const named = titles.slice(0, MOST_NAMED).join(", ");
  return titles.length > MOST_NAMED ? `${named}…` : `${named}.`;
}

/**
 * The pages that say every word asked, for an agent, without a line at the
 * reader's prompt: `find` and `grep` in one, the pages named for it first,
 * each with the lines that say it.
 */
export const searchTool: AgentTool = {
  name: "search",
  description: "The pages of this site that say every word of a query, the ones named for it first, each with its title, summary and the lines that say it. Nothing on the reader's screen moves.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "the words to look for; case does not matter" },
      under: { type: "string", description: "only the pages under this address, e.g. /projects/" },
    },
    required: ["query"],
    additionalProperties: false,
  },
  readOnly: true,
  shows: false,
  answer(input, { site }) {
    const query = String(input["query"] ?? "").trim();
    if (!query) return { refused: "query: say what to look for" };
    const words = query.toLowerCase().split(/\s+/);
    const under = routeAsked(String(input["under"] ?? "/"));

    const candidates = site.pages.filter((page) => page.route.startsWith(under));
    const named = candidates.filter((page) => says(`${page.route} ${page.title}`, words));
    const told = candidates.filter((page) => !named.includes(page) && says(`${page.summary}\n${page.body}`, words));
    const found = [...named, ...told];

    const linesOf = (page: Page) =>
      page.body
        .split("\n")
        .map(plainLineOf)
        .filter((line) => words.some((word) => line.toLowerCase().includes(word)))
        .slice(0, MOST_LINES);
    const pages = found.slice(0, MOST_PAGES).map((page) => ({ path: page.route, title: page.title, summary: page.summary, lines: linesOf(page) }));
    const summary =
      found.length === 0
        ? `No page says "${query}".`
        : `${found.length} ${found.length === 1 ? "page says" : "pages say"} "${query}": ${saidIn(found.map((page) => page.title))}`;
    return { summary, data: { pages } };
  },
};
