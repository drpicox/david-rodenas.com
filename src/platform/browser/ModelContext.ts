export interface Tool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: object;
  readonly annotations?: { readonly readOnlyHint?: boolean };
  /** Answers in words, a refusal among them. */
  execute(input: Record<string, unknown>): Promise<string>;
}

/**
 * The part of WebMCP this site uses: a page offering tools to the agent in
 * its browser. The proposal is a draft and has moved — from `navigator` to
 * `document`, from an `unregisterTool` to an abort signal — so this is only
 * what both shapes agree on, and the rest is tried where it is used.
 */
export interface ModelContext {
  registerTool(tool: Tool, options?: { signal?: AbortSignal }): unknown;
  unregisterTool?(name: string): void;
}
