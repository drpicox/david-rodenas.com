import type { AgentTool } from "../plugin/AgentTool";
import { readTool } from "./readTool";
import { searchTool } from "./searchTool";

/** The tools that are about the site itself, as the shell's own commands are: they need nothing from any feature. */
export const siteTools: readonly AgentTool[] = [readTool, searchTool];
