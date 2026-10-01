import type { AgentTool } from "../plugin/AgentTool";
import { routeAsked } from "./routeAsked";

/**
 * A page's words, for an agent, without a line at the reader's prompt: what
 * `cat` prints, as the markdown it was written in, so its links come too.
 * Reading changes nothing, so nothing on the reader's screen moves.
 */
export const readTool: AgentTool = {
  name: "read",
  description: "The words of one page of this site, as the markdown it is written in, and the pages under it. Nothing on the reader's screen moves.",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string", description: "the page's address, e.g. /projects/rocket/ — or its whole URL" } },
    required: ["path"],
    additionalProperties: false,
  },
  readOnly: true,
  shows: false,
  answer(input, { site }) {
    const path = String(input["path"] ?? "");
    const page = site.at(routeAsked(path));
    if (!page) return { refused: `no page at ${path}: search finds pages by what they say` };
    const pages = site.childrenOf(page.route).map(({ route, title, summary }) => ({ path: route, title, summary }));
    return {
      summary: page.summary ? `${page.title}: ${page.summary}` : page.title,
      data: { title: page.title, summary: page.summary, markdown: page.body, pages },
      route: page.route,
    };
  },
};
