import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import type { AgentTool } from "../plugin/AgentTool";
import { describeTool } from "../plugin/describeTool";

/** A tool in one line: its name, what it takes, and what it does, without the sentences every tool shares. */
function toolLine(tool: AgentTool): string {
  const takes = Object.keys(describeTool(tool).inputSchema.properties).join(", ");
  return `- \`${tool.name}\` (${takes}): ${tool.description}`;
}

/**
 * The site as an agent with no browser is told of it, in the shape
 * llmstxt.org proposes: whose it is, then every page by its address and its
 * summary, under the directory it stands in — and the tools a browser with
 * WebMCP is offered, which such an agent cannot call and should know are
 * there. Written from the same pages and the same tools as everything else,
 * so it cannot fall behind them.
 */
export function llmsTxtOf(site: Site, tools: readonly AgentTool[], origin: string): string {
  const home = site.at("/");
  const line = (page: Page) => `- [${page.title}](${origin}${page.route})${page.summary ? `: ${page.summary}` : ""}`;
  const under = (route: string): Page[] => site.childrenOf(route).filter((page) => !page.link).flatMap((page) => [page, ...under(page.route)]);
  const sections = site
    .childrenOf("/")
    .filter((page) => !page.link)
    .map((top) => `## ${top.title}\n\n${[top, ...under(top.route)].map(line).join("\n")}\n`);
  const shows = tools.find((tool) => tool.shows);
  const example = shows ? ` For example, \`${shows.name} {"show": false}\` answers without moving the reader's page.` : "";

  return [
    `# ${home?.title ?? origin}\n`,
    `> ${home?.summary ?? ""}\n`,
    `Every page is plain HTML at its address, its words in the page and not drawn by a script. In a browser with WebMCP, the site offers the tools at the end to the agent in it.\n`,
    ...sections,
    `## Tools\n`,
    `Offered on every page, in a browser with WebMCP (\`document.modelContext\`). Each answers as JSON: \`summary\`, in words; \`data\`, the figures, each with its unit in its name; \`url\`; and \`shown\`, for one that puts its answer in front of the reader unless it is told \`show: false\`.${example}\n`,
    `${tools.map(toolLine).join("\n")}\n- \`shell\` (line): runs a line at the prompt the reader sees, as if they had typed it: ls, cd, cat, find, grep, help, and every program as a command.\n`,
  ].join("\n");
}
