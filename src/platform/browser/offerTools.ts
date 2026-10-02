import type { AgentTool, ToolReply } from "../plugin/AgentTool";
import { answerOf } from "../plugin/answerOf";
import { describeTool } from "../plugin/describeTool";
import type { Site } from "../content/Site";
import type { Outcome } from "../command/Outcome";
import { plainTextOf } from "../command/plainTextOf";
import { askProgram } from "./askProgram";
import type { ModelContext, Tool } from "./ModelContext";

export interface Surface {
  readonly tools: readonly AgentTool[];
  readonly site: Site;
  /** Where the site is served from, so that an answer gives a page as an address the agent can quote. */
  readonly origin: string;
  /** Moves the page to a route without a reload, the way a link does. */
  readonly goTo: (route: string) => boolean;
  /** Runs a line at the prompt, echo and all. */
  readonly run: (line: string) => Outcome[];
}

/** The program's place on the page, going to the page that has it when this one does not. */
function placeOf(app: string, route: string | undefined, goTo: Surface["goTo"]): HTMLElement | null {
  const selector = `.app[data-app="${app}"]`;
  const here = document.querySelector<HTMLElement>(selector);
  if (here) return here;
  if (route === undefined || !goTo(route)) return null;
  return document.querySelector<HTMLElement>(selector);
}

/** Puts a reply in front of the reader, the program asked what the agent asked; says whether it could, for the answer to say so. */
function shownTo({ show, route }: ToolReply, { goTo }: Surface): boolean {
  if (!show) return false;
  const place = placeOf(show.app, route, goTo);
  if (!place) return false;
  askProgram(place, show.values);
  place.scrollIntoView?.({ behavior: "smooth", block: "start" });
  return true;
}

function offered(tool: AgentTool, surface: Surface): Tool {
  const said = (answer: object) => JSON.stringify(answer);
  return {
    ...describeTool(tool),
    async execute(input) {
      if (!tool.shows) return said(answerOf(await tool.answer(input, surface), surface.origin));
      const { show = true, ...asked } = input;
      if (typeof show !== "boolean") return said(answerOf({ refused: `show: ${String(show)} is not true or false` }, surface.origin));
      const reply = await tool.answer(asked, surface);
      return said(answerOf(reply, surface.origin, !("refused" in reply) && show && shownTo(reply, surface)));
    },
  };
}

function shellTool({ run, origin }: Surface): Tool {
  return {
    name: "shell",
    description:
      "Runs a line at this site's prompt, as if the reader had typed it, and they see it echoed and answered. " +
      "The site is laid out as directories of pages: ls, cd, cat README.md, find, grep and help work over it, " +
      "and every program is a command too. Commands chain with &&. To read or search without the reader seeing it, read and search do. " +
      "Answers as JSON: summary, what the line printed.",
    inputSchema: { type: "object", properties: { line: { type: "string", description: "the line to run, e.g. `cd projects && ls`" } }, required: ["line"], additionalProperties: false },
    async execute(input) {
      const outcomes = run(String(input["line"] ?? ""));
      const printed = outcomes.map(plainTextOf).filter(Boolean).join("\n\n");
      return JSON.stringify(answerOf(outcomes.some((outcome) => outcome.error) ? { refused: printed } : { summary: printed }, origin, true));
    },
  };
}

/**
 * Offers the site to the agent in the reader's browser, if the browser has
 * one: the tools it is handed, and the prompt as one more. Showing is the
 * default — the dials move, the line is echoed — because work the reader
 * cannot watch is done on a different site from the one they are on. An agent
 * may still ask not to, to compare ten trips without taking the reader through
 * ten pages; so every answer says whether the reader saw it, and the agent
 * never has to guess what is in front of them. Returns how to take the tools back.
 */
export function offerTools(context: ModelContext | undefined, surface: Surface): () => void {
  if (!context) return () => {};
  const controller = new AbortController();
  const tools = [...surface.tools.map((tool) => offered(tool, surface)), shellTool(surface)];
  for (const tool of tools) context.registerTool(tool, { signal: controller.signal });
  return () => {
    controller.abort();
    for (const tool of tools) context.unregisterTool?.(tool.name);
  };
}
