import type { Program } from "./Program";

export interface InputSchema {
  readonly type: "object";
  readonly properties: Readonly<Record<string, { type: "number"; minimum: number; maximum: number; default: number; description: string }>>;
  readonly required: readonly string[];
  readonly additionalProperties: false;
}

/**
 * The parameters as the JSON schema a tool is described by. Nothing is
 * required, because nothing is on a dial: every parameter has a start.
 */
export function inputSchemaOf(program: Program): InputSchema {
  const properties = Object.fromEntries(
    program.parameters.map((parameter) => [
      parameter.name,
      { type: "number" as const, minimum: parameter.min, maximum: parameter.max, default: parameter.initial, description: `${parameter.label}: ${parameter.description}` },
    ]),
  );
  return { type: "object", properties, required: [], additionalProperties: false };
}
