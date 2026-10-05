import type { Literal, NodeKind, OutputPin } from "../blueprint/NodeKind";
import type { Cell, Column, Table } from "../blueprint/Table";
import { initialValues } from "../program/initialValues";
import type { Program } from "../program/Program";
import { settleValues } from "../program/settleValues";

/** cleanFeatures as a pin is called, clean-features: a name a blueprint's text can write. */
const pinNameOf = (path: readonly string[]) =>
  path
    .join("-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");

/** What a figure of a program's answer is, found where it was, by the path to it. */
interface Figure {
  readonly pin: OutputPin;
  readonly path: readonly string[];
}

const at = (data: unknown, path: readonly string[]): unknown => path.reduce<unknown>((inside, key) => (inside && typeof inside === "object" ? (inside as Record<string, unknown>)[key] : undefined), data);

/** A list of objects as a table: a column for each figure of the first, of numbers or of words. */
function tableOf(list: readonly unknown[]): Table {
  const first = (list[0] ?? {}) as Record<string, unknown>;
  const columns = Object.entries(first).flatMap(([name, value]): Column[] => (typeof value === "number" ? [{ name, kind: "number" }] : typeof value === "string" ? [{ name, kind: "text" }] : []));
  const rows = list.map((row) => Object.fromEntries(columns.map((column): [string, Cell] => [column.name, ((row as Record<string, unknown>)[column.name] as Cell | undefined) ?? null])));
  return { columns, rows };
}

/** The figures of an answer: its numbers, words, yes and no, and its lists, however deep they are kept. */
function figuresOf(data: unknown, path: readonly string[] = []): Figure[] {
  if (typeof data === "number") return [{ pin: { name: pinNameOf(path), label: pinNameOf(path).replace(/-/g, " "), type: "number" }, path }];
  if (typeof data === "boolean") return [{ pin: { name: pinNameOf(path), label: pinNameOf(path).replace(/-/g, " "), type: "flag" }, path }];
  if (typeof data === "string") return [{ pin: { name: pinNameOf(path), label: pinNameOf(path).replace(/-/g, " "), type: "text" }, path }];
  if (Array.isArray(data)) return data.length > 0 && typeof data[0] === "object" ? [{ pin: { name: pinNameOf(path), label: pinNameOf(path).replace(/-/g, " "), type: "table" }, path }] : [];
  if (data && typeof data === "object") return Object.entries(data).flatMap(([key, value]) => figuresOf(value, [...path, key]));
  return [];
}

const titleOf = (name: string) => `${name.charAt(0).toUpperCase()}${name.slice(1).replace(/-/g, " ")}`;

/**
 * A program of the site, read a fifth way: as a node of a blueprint. Its
 * parameters are its inputs, written as its dials are; the figures of its
 * answer are its outputs — its lists as tables — found in the answer it gives
 * when told nothing; and the picture it draws on its own page is painted on
 * the board. So a simulation can be swept by a dial, or its months set beside
 * anything else the site measures.
 */
export function programNode(program: Program): NodeKind {
  const figures = figuresOf(program.run(initialValues(program)).data);
  return {
    name: program.name,
    title: titleOf(program.name),
    role: "paint",
    shelf: "Programs",
    summary: `${program.summary.charAt(0).toUpperCase()}${program.summary.slice(1)}: the program of its page, as a node.`,
    inputs: program.parameters.map((parameter) =>
      "choices" in parameter
        ? { name: parameter.name, label: parameter.label.toLowerCase(), type: "text", initial: parameter.initial as Literal, hint: parameter.description, editor: { kind: "choice", choices: parameter.choices.map((choice) => ({ value: choice, label: choice })) } }
        : { name: parameter.name, label: parameter.label.toLowerCase(), type: "number", initial: parameter.initial, hint: parameter.description, editor: { kind: "number", min: parameter.min, max: parameter.max, step: parameter.step, ...(parameter.show && { show: parameter.show }) } },
    ),
    outputs: figures.map((figure) => figure.pin),
    run: (inputs) => {
      const settled = settleValues(program, inputs);
      if ("error" in settled) throw new Error(settled.error);
      const answer = program.run(settled.values);
      // A figure that is none this time — a break-even never reached — is no value, not a zero.
      const outputs = Object.fromEntries(figures.map(({ pin, path }) => [pin.name, pin.type === "table" ? tableOf((at(answer.data, path) as unknown[] | undefined) ?? []) : (at(answer.data, path) ?? undefined)]));
      return { outputs, painting: { html: answer.html, caption: answer.text.split("\n")[0] ?? "" } };
    },
  };
}
