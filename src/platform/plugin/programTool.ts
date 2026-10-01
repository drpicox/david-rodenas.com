import { pageShowing } from "../content/pageShowing";
import { inputSchemaOf } from "../program/inputSchemaOf";
import type { Program } from "../program/Program";
import { settleValues } from "../program/settleValues";
import type { AgentTool } from "./AgentTool";

/**
 * A program as a tool: asked with the fields an agent filled in, answered
 * with its words and its figures, and shown — when it is to be — by asking
 * the program on its page the same, so the reader sees its dials move.
 */
export function programTool(program: Program): AgentTool {
  return {
    name: program.name,
    description: `${program.summary}.`,
    inputSchema: inputSchemaOf(program),
    readOnly: true,
    shows: true,
    answer(input, { site }) {
      const settled = settleValues(program, input);
      if ("error" in settled) return { refused: settled.error };
      const { text, data } = program.run(settled.values);
      const route = pageShowing(site, program.name)?.route;
      return { summary: text, data, ...(route !== undefined && { route }), show: { app: program.name, values: settled.values } };
    },
  };
}
