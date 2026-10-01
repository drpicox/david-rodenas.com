import type { AgentTool, ToolSchema } from "./AgentTool";

const ANSWERS = "Answers as JSON: summary, in words; data, the figures, each with its unit in its name; url, the page it is about; source and refreshed, for figures someone else publishes.";

const SHOW = {
  type: "boolean",
  default: true,
  description: "true puts it in front of the reader: the site goes to the page that has it, and what is there moves to what was asked. false answers and leaves the reader's page as it is.",
};

/** A tool as the agent is told of it: what it does, how it answers, what it takes, and whether it can show the reader. */
export function describeTool(tool: AgentTool): { name: string; description: string; inputSchema: ToolSchema; annotations: { readOnlyHint: boolean } } {
  const shows = tool.shows ? " Unless told show: false, the reader is shown it too; the answer's shown says whether they were." : "";
  const inputSchema = tool.shows ? { ...tool.inputSchema, properties: { ...tool.inputSchema.properties, show: SHOW } } : tool.inputSchema;
  return { name: tool.name, description: `${tool.description} ${ANSWERS}${shows}`, inputSchema, annotations: { readOnlyHint: tool.readOnly } };
}
