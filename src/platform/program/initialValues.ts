import type { Program } from "./Program";
import type { Values } from "./Values";

/** What a program is run with when it has been told nothing. */
export function initialValues(program: Program): Values {
  return Object.fromEntries(program.parameters.map((parameter) => [parameter.name, parameter.initial]));
}
