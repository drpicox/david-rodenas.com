import type { AgentTool } from "./AgentTool";
import { blueprintKitOf } from "./blueprintKitOf";
import { blueprintTool } from "./blueprintTool";
import { programTool } from "./programTool";
import type { Feature } from "./Feature";

/**
 * Every tool the features bring an agent: their programs, each one a tool,
 * the tools they bring as such, and blueprints, written with every node the
 * features bring.
 */
export function toolsOf(features: readonly Feature[]): AgentTool[] {
  return [...features.flatMap((feature) => feature.programs ?? []).map(programTool), ...features.flatMap((feature) => feature.tools ?? []), blueprintTool(blueprintKitOf(features))];
}
