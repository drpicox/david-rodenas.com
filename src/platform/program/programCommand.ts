import type { Command } from "../shell/Command";
import type { Parameter } from "./Parameter";
import type { Program } from "./Program";
import { readOptions } from "./readOptions";
import { settleValues } from "./settleValues";
import { wordOf } from "./wordOf";

const takes = (parameter: Parameter) => ("choices" in parameter ? parameter.choices.map(wordOf).join("|") : "n");
const range = (parameter: Parameter) => ("choices" in parameter ? wordOf(parameter.initial) : `${parameter.min} to ${parameter.max}, ${parameter.initial}`);

function helpOf(program: Program): string {
  const usage = [program.name, ...program.parameters.map((parameter) => `[--${parameter.name} ${takes(parameter)}]`)].join(" ");
  const width = Math.max(...program.parameters.map((parameter) => parameter.name.length + 2));
  const options = program.parameters.map((parameter) => `  ${`--${parameter.name}`.padEnd(width)}  ${parameter.description} (${range(parameter)})`);
  return [usage, `  ${program.summary}`, "", ...options].join("\n");
}

/**
 * A program as a command at the prompt. Its answer is printed inside the same
 * frame its page draws it in, so a chart in the terminal is the chart on the page.
 */
export function programCommand(program: Program): Command {
  return {
    name: program.name,
    usage: `${program.name} [--help] [--option n]...`,
    description: program.summary,
    run(_context, args) {
      const read = readOptions(args);
      if ("help" in read) return { text: helpOf(program) };
      const settled = "error" in read ? read : settleValues(program, read.given);
      if ("error" in settled) return { text: `${program.name}: ${settled.error}`, error: true };
      const answer = program.run(settled.values);
      return { text: answer.text, html: `<div class="app program-out">${answer.html}</div>` };
    },
  };
}
