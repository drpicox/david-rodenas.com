import type { Parameter } from "./Parameter";
import type { ProgramRun } from "./ProgramRun";
import type { Values } from "./Values";

/**
 * A demonstration as a program with an input and an output, and nothing else.
 *
 * Written once, it is read four ways: the build runs it with the initial
 * values for the still, the shell runs it with the options typed, the page
 * runs it again every time a dial moves, and an agent runs it with the fields
 * it filled in. None of them is the program; each is a way of asking it.
 */
export interface Program {
  /** The command, the `::name` in the markdown, and the tool: one word for all three. */
  readonly name: string;
  /** One line on what it answers. */
  readonly summary: string;
  readonly parameters: readonly Parameter[];
  /** Always handed a value for every parameter, already inside its range. */
  run(values: Values): ProgramRun;
}
