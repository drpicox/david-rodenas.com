import { pageShowing } from "../content/pageShowing";
import type { Site } from "../content/Site";
import { inputSchemaOf } from "../program/inputSchemaOf";
import type { Program } from "../program/Program";
import { settleValues } from "../program/settleValues";
import type { Values } from "../program/Values";
import type { Outcome } from "../shell/Outcome";
import { plainTextOf } from "../shell/plainTextOf";
import { askProgram } from "./askProgram";
import type { ModelContext, Tool } from "./ModelContext";

export interface Surface {
  readonly programs: readonly Program[];
  readonly site: Site;
  /** Moves the page to a route without a reload, the way a link does. */
  readonly goTo: (route: string) => boolean;
  /** Runs a line at the prompt, echo and all. */
  readonly run: (line: string) => Outcome[];
}

/** The program's place on the page, going to the page that has it when this one does not. */
function placeOf(name: string, { site, goTo }: Surface): HTMLElement | null {
  const selector = `.app[data-app="${name}"]`;
  const here = document.querySelector<HTMLElement>(selector);
  if (here) return here;
  const page = pageShowing(site, name);
  if (!page || !goTo(page.route)) return null;
  return document.querySelector<HTMLElement>(selector);
}

function programTool(program: Program, surface: Surface): Tool {
  return {
    name: program.name,
    description: `${program.summary}. The reader sees it too: the site goes to the program's page and its dials move to what was asked. Answers in words, then the figures as JSON.`,
    inputSchema: inputSchemaOf(program),
    annotations: { readOnlyHint: true },
    async execute(input) {
      const settled = settleValues(program, input);
      if ("error" in settled) throw new Error(settled.error);
      const answer = program.run(settled.values);
      show(program.name, settled.values, surface);
      return `${answer.text}\n\n${JSON.stringify(answer.data)}`;
    },
  };
}

function show(name: string, values: Values, surface: Surface): void {
  const place = placeOf(name, surface);
  if (!place) return;
  askProgram(place, values);
  place.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function shellTool({ run, programs }: Surface): Tool {
  return {
    name: "shell",
    description:
      "Runs a line at this site's prompt, as if the reader had typed it, and they see it echoed and answered. " +
      "The site is laid out as directories of pages: ls, cd, cat README.md, find, grep and help work over it, " +
      `and so does every program: ${programs.map((program) => program.name).join(", ")}. Commands chain with &&.`,
    inputSchema: { type: "object", properties: { line: { type: "string", description: "the line to run, e.g. `cd projects && ls`" } }, required: ["line"], additionalProperties: false },
    async execute(input) {
      const outcomes = run(String(input["line"] ?? ""));
      const said = outcomes.map(plainTextOf).filter(Boolean).join("\n\n");
      if (outcomes.some((outcome) => outcome.error)) throw new Error(said);
      return said;
    },
  };
}

/**
 * Offers the site to the agent in the reader's browser, if the browser has
 * one: every program as a tool, and the prompt as one more. Both act where the
 * reader can see — the dials move, the line is echoed — because an agent
 * working a page nobody can watch would be a different site from the one the
 * reader is on. Returns how to take the tools back.
 */
export function offerTools(context: ModelContext | undefined, surface: Surface): () => void {
  if (!context) return () => {};
  const controller = new AbortController();
  const tools = [...surface.programs.map((program) => programTool(program, surface)), shellTool(surface)];
  for (const tool of tools) context.registerTool(tool, { signal: controller.signal });
  return () => {
    controller.abort();
    for (const tool of tools) context.unregisterTool?.(tool.name);
  };
}
