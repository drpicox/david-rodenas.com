import type { Site } from "../content/Site";
import type { Values } from "../program/Values";

/** What a tool is handed besides what it was asked: the site it answers about, and where it is served from. */
export interface ToolSurroundings {
  readonly site: Site;
  readonly origin: string;
}

/** A tool's answer before it is said: in words, in figures, and where it can be seen. */
export interface ToolReply {
  /** One or two sentences that answer the question. */
  readonly summary: string;
  /** The figures, each with its unit in its name. */
  readonly data?: unknown;
  /** The page it is about. */
  readonly route?: string;
  /** Who publishes the figures, when they are someone else's. */
  readonly source?: string;
  /** The day the figures were last brought up to date, as YYYY-MM-DD. */
  readonly refreshed?: string;
  /** What to put in front of the reader, when they are to see it: the program standing on `route`, and what to ask it. */
  readonly show?: { readonly app: string; readonly values: Values };
}

/** Why nothing was answered: said, so that the agent can ask again better. */
export interface Refusal {
  readonly refused: string;
}

export interface ToolSchema {
  readonly type: "object";
  readonly properties: Readonly<Record<string, object>>;
  readonly required: readonly string[];
  readonly additionalProperties: false;
}

/**
 * Something an agent in the reader's browser can ask the site, written in
 * node: what it is, what it takes, and how it answers. Where the answer goes —
 * the agent, and the reader's page when it shows — is the browser's business.
 */
export interface AgentTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: ToolSchema;
  /** Changes nothing the site holds: showing may take the reader to another page, as a link would, and no more. */
  readonly readOnly: boolean;
  /** Has something to put in front of the reader, and takes a `show` to say whether it should. */
  readonly shows: boolean;
  answer(input: Readonly<Record<string, unknown>>, surroundings: ToolSurroundings): ToolReply | Refusal | Promise<ToolReply | Refusal>;
}
