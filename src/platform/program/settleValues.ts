import type { Program } from "./Program";
import type { Values } from "./Values";

const listed = (names: readonly string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`);

/**
 * Whatever a program was told, from a command line or from an agent, made into
 * a value for every parameter or refused with the reason. A value out of range
 * is refused and not clamped: whoever asked for it would otherwise be answered
 * a question they did not ask, and not know.
 */
export function settleValues(program: Program, given: Readonly<Record<string, unknown>>): { values: Values } | { error: string } {
  const names = program.parameters.map((parameter) => parameter.name);
  const stranger = Object.keys(given).find((name) => !names.includes(name));
  if (stranger !== undefined) return { error: `no option ${stranger}: choose ${listed(names)}` };

  const values: Record<string, number> = {};
  for (const parameter of program.parameters) {
    const said = given[parameter.name];
    const value = said === undefined ? parameter.initial : typeof said === "number" ? said : typeof said === "string" && said.trim() !== "" ? Number(said) : Number.NaN;
    if (!Number.isFinite(value)) return { error: `${parameter.name}: ${String(said)} is not a number` };
    if (value < parameter.min || value > parameter.max) return { error: `${parameter.name}: ${value} is outside ${parameter.min} to ${parameter.max}` };
    values[parameter.name] = value;
  }
  return { values };
}
