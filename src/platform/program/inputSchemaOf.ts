import type { Parameter } from "./Parameter";
import type { Program } from "./Program";

type Property =
  | { type: "number"; minimum: number; maximum: number; default: number; description: string }
  | { type: "string"; enum: readonly string[]; default: string; description: string };

export interface InputSchema {
  readonly type: "object";
  readonly properties: Readonly<Record<string, Property>>;
  readonly required: readonly string[];
  readonly additionalProperties: false;
}

function propertyOf(parameter: Parameter): Property {
  const description = `${parameter.label}: ${parameter.description}`;
  return "choices" in parameter
    ? { type: "string", enum: parameter.choices, default: parameter.initial, description }
    : { type: "number", minimum: parameter.min, maximum: parameter.max, default: parameter.initial, description };
}

/**
 * The parameters as the JSON schema a tool is described by. Nothing is
 * required, because nothing is on a dial: every parameter has a start.
 */
export function inputSchemaOf(program: Program): InputSchema {
  const properties = Object.fromEntries(program.parameters.map((parameter) => [parameter.name, propertyOf(parameter)]));
  return { type: "object", properties, required: [], additionalProperties: false };
}
