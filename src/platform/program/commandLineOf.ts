import type { Program } from "./Program";
import type { Values } from "./Values";
import { wordOf } from "./wordOf";

/** Four figures: more than a dial can be set to by hand, fewer than the float a logarithm leaves behind. */
const said = (value: number | string) => (typeof value === "string" ? wordOf(value) : String(Number(value.toPrecision(4))));

/**
 * The line that, typed at the prompt, would ask for what the dials show. It
 * stands under a program on its page, so that moving a dial also teaches the
 * command, and names only what moved.
 */
export function commandLineOf(program: Program, values: Values): string {
  const options = program.parameters.flatMap((parameter) => {
    const value = values[parameter.name];
    return value === undefined || said(value) === said(parameter.initial) ? [] : [`--${parameter.name} ${said(value)}`];
  });
  return [program.name, ...options].join(" ");
}
