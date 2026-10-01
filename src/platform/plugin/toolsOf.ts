import type { AgentTool } from "./AgentTool";
import { programTool } from "./programTool";
import type { Feature } from "./Feature";

/** Every tool the features bring an agent: their programs, each one a tool. */
export function toolsOf(features: readonly Feature[]): AgentTool[] {
  return features.flatMap((feature) => feature.programs ?? []).map(programTool);
}
