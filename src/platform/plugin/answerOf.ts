import type { Refusal, ToolReply } from "./AgentTool";

/** What every tool answers, in one shape, so that an agent reads them all the same way. */
export interface Answer {
  readonly summary: string;
  readonly data?: unknown;
  readonly url?: string;
  readonly source?: string;
  readonly refreshed?: string;
  readonly shown?: boolean;
  readonly refused?: true;
}

/**
 * A tool's reply as the agent is given it. The page is an address, so it can
 * be quoted; `shown` is there only for a tool that had something to show, to
 * say whether the reader saw it. A refusal is said and not thrown: Chrome
 * answers a tool that throws with a message of its own that the invocation
 * failed, and the reason — the one thing an agent needs to ask again better —
 * is lost on the way.
 */
export function answerOf(reply: ToolReply | Refusal, origin: string, shown?: boolean): Answer {
  if ("refused" in reply) return { summary: `Refused, nothing was run: ${reply.refused}`, refused: true };
  const { summary, data, route, source, refreshed } = reply;
  return {
    summary,
    ...(data !== undefined && { data }),
    ...(route !== undefined && { url: `${origin}${route}` }),
    ...(source !== undefined && { source }),
    ...(refreshed !== undefined && { refreshed }),
    ...(shown !== undefined && { shown }),
  };
}
