import type { Blueprint, PlacedNode, Wire } from "./Blueprint";
import { fits } from "./fits";
import type { Kit } from "./kitOf";
import type { InputPin, Literal } from "./NodeKind";

/** A blueprint read from its text, what could not be read and on which line, and whether every node said where it stands. */
export interface BlueprintRead {
  readonly blueprint: Blueprint;
  readonly problems: readonly { readonly line: number; readonly message: string }[];
  readonly placed: boolean;
}

interface Token {
  readonly text: string;
  readonly quoted: boolean;
}

interface Statement {
  readonly line: number;
  readonly id?: string;
  readonly kind: string;
  readonly title?: string;
  readonly args: readonly { readonly name: string; readonly value: Token }[];
  readonly at?: { readonly x: number; readonly y: number };
}

const NAME = /^[A-Za-z_][\w-]*$/;
const KIND = /^[a-z][a-z0-9-]*$/;
const ARGUMENT = /^([a-z][a-z0-9-]*):(.*)$/;
const REFERENCE = /^([A-Za-z_][\w-]*?)(?:\.([a-z][a-z0-9-]*))?$/;
const ESCAPES: Readonly<Record<string, string>> = { n: "\n", '"': '"', "\\": "\\" };
const EXAMPLE = "a line names a kind of node, as in: heat = weather-months station: D5";

/** A line's words, a quoted value as one word with its escapes undone, and nothing after a # that is not inside quotes. */
function tokensOf(line: string): Token[] | string {
  const tokens: Token[] = [];
  let at = 0;
  while (at < line.length) {
    const here = line[at] ?? "";
    if (/\s/.test(here)) at += 1;
    else if (here === "#") break;
    else if (here === '"') {
      let text = "";
      for (at += 1; line[at] !== '"'; at += 1) {
        if (at >= line.length) return "a quote is not closed";
        if (line[at] === "\\") {
          at += 1;
          text += ESCAPES[line[at] ?? ""] ?? line[at] ?? "";
        } else text += line[at];
      }
      at += 1;
      tokens.push({ text, quoted: true });
    } else {
      const start = at;
      while (at < line.length && !/[\s"]/.test(line[at] ?? "")) at += 1;
      tokens.push({ text: line.slice(start, at), quoted: false });
    }
  }
  return tokens;
}

/** One line as a node: its name, its kind, its title, what is written on it, and where it stands; or what is wrong with it. */
function statementOf(tokens: readonly Token[], line: number): Statement | string {
  const named = tokens[1]?.text === "=" && !tokens[1].quoted;
  const id = named ? tokens[0] : undefined;
  if (id && (id.quoted || !NAME.test(id.text))) return `${id.text} cannot name a node: a name is letters, digits and dashes`;
  const kind = tokens[named ? 2 : 0];
  if (!kind || kind.quoted || !KIND.test(kind.text)) return EXAMPLE;
  let at = named ? 3 : 1;
  const title = tokens[at]?.quoted ? tokens[at]?.text : undefined;
  if (title !== undefined) at += 1;
  const args: { name: string; value: Token }[] = [];
  let where: Statement["at"];
  while (at < tokens.length) {
    const token = tokens[at] as Token;
    if (!token.quoted && token.text === "@") {
      const [x, y] = [Number(tokens[at + 1]?.text), Number(tokens[at + 2]?.text)];
      if (!Number.isFinite(x) || !Number.isFinite(y) || at + 3 !== tokens.length) return "@ ends a line with where the node stands: @ 40 120";
      where = { x, y };
      break;
    }
    const argument = token.quoted ? null : ARGUMENT.exec(token.text);
    if (!argument) return `${token.text} is not an input and its value, as in: station: D5`;
    const attached = argument[2] ?? "";
    const value = attached !== "" ? { text: attached, quoted: false } : tokens[at + 1];
    if (!value) return `${argument[1]}: has no value`;
    args.push({ name: argument[1] ?? "", value });
    at += attached !== "" ? 1 : 2;
  }
  return { line, ...(id && { id: id.text }), kind: kind.text, ...(title !== undefined && { title }), args, ...(where && { at: where }) };
}

/** A value written by hand, as its input takes it; or why it cannot be. A dial's value waits until it is known what it is wired into. */
function literalFor(pin: InputPin, token: Token, typeLabel: string): Literal | { problem: string } | "later" {
  const { text } = token;
  if (pin.type === "number") return Number.isFinite(Number(text)) && text.trim() !== "" ? Number(text) : { problem: `${pin.name} takes a number, not ${text}` };
  if (pin.type === "flag") {
    if (/^(yes|true|on)$/.test(text)) return true;
    if (/^(no|false|off)$/.test(text)) return false;
    return { problem: `${pin.name} takes yes or no, not ${text}` };
  }
  if (pin.type === "text") return text;
  if (pin.type === "value") return "later";
  return { problem: `${pin.name} takes ${typeLabel}, wired from a node: ${text} names none` };
}

/** A dial's value, as the input it is wired into takes it: a station's code stays words, a threshold is a number. */
function valueAs(type: string | undefined, text: string): Literal {
  if (type === "text") return text;
  if (type === "flag") return /^(yes|true|on)$/.test(text);
  const number = Number(text);
  return type === "number" || (Number.isFinite(number) && text.trim() !== "") ? number : text;
}

/**
 * A blueprint from its text: one node a line, `name = kind "Title" input:
 * value … @ x y`, where a value that names another node — or one of its
 * outputs, after a dot — is a wire from it, wherever what it gives could go
 * into that input. The text is what a page writes a blueprint in, what a link
 * carries and what an agent can read, so a line that cannot be read is said,
 * by its number, and the rest is read anyway.
 */
export function parseBlueprint(text: string, kit: Kit): BlueprintRead {
  const problems: { line: number; message: string }[] = [];
  const statements: Statement[] = [];
  const taken = new Set<string>();
  text.split(/\r?\n/).forEach((source, index) => {
    const tokens = tokensOf(source);
    if (Array.isArray(tokens) && tokens.length === 0) return;
    const statement = typeof tokens === "string" ? tokens : statementOf(tokens, index + 1);
    if (typeof statement === "string") problems.push({ line: index + 1, message: statement });
    else if (statement.id !== undefined && taken.has(statement.id)) problems.push({ line: index + 1, message: `${statement.id} is the name of another node already` });
    else {
      if (statement.id !== undefined) taken.add(statement.id);
      statements.push(statement);
    }
  });

  const ids = statements.map((statement) => {
    if (statement.id !== undefined) return statement.id;
    let id = statement.kind;
    for (let count = 2; taken.has(id); count += 1) id = `${statement.kind}-${count}`;
    taken.add(id);
    return id;
  });
  const kindOf = new Map(statements.map((statement, at) => [ids[at] as string, kit.kinds.get(statement.kind)]));
  const wires: Wire[] = [];
  const later: { node: string; pin: string; text: string }[] = [];
  const valuesOf = new Map<string, Record<string, Literal>>();
  const nodes: PlacedNode[] = statements.map((statement, at) => {
    const id = ids[at] as string;
    const kind = kit.kinds.get(statement.kind);
    const values: Record<string, Literal> = {};
    valuesOf.set(id, values);
    for (const { name, value } of statement.args) {
      const pin = kind?.inputs.find((input) => input.name === name);
      if (kind && !pin) {
        problems.push({ line: statement.line, message: `${statement.kind} takes no ${name}` });
        continue;
      }
      const reference = value.quoted ? null : REFERENCE.exec(value.text);
      const from = reference?.[1];
      if (from !== undefined && from !== id && kindOf.has(from)) {
        const out = reference?.[2] ?? kindOf.get(from)?.outputs[0]?.name ?? "value";
        // A column called as a node is called is a column: a name is a wire only where what the node gives could go.
        const given = kindOf.get(from)?.outputs.find((output) => output.name === out)?.type;
        if (!pin || !given || fits(kit, given, pin.type)) {
          wires.push({ from: { node: from, pin: out }, to: { node: id, pin: name } });
          continue;
        }
      }
      if (!pin) {
        values[name] = value.text;
        continue;
      }
      const literal = literalFor(pin, value, kit.types.get(pin.type)?.label ?? pin.type);
      if (literal === "later") later.push({ node: id, pin: name, text: value.text });
      else if (typeof literal === "object") problems.push({ line: statement.line, message: literal.problem });
      else values[name] = literal;
    }
    return { id, kind: statement.kind, x: statement.at?.x ?? 0, y: statement.at?.y ?? 0, ...(statement.title !== undefined && { title: statement.title }), values };
  });

  // A dial's value is read once its wires are known: it is whatever the first input it is wired into takes.
  for (const { node, pin, text: written } of later) {
    const into = wires.find((wire) => wire.from.node === node);
    const type = into ? kindOf.get(into.to.node)?.inputs.find((input) => input.name === into.to.pin)?.type : undefined;
    const values = valuesOf.get(node);
    if (values) values[pin] = valueAs(type, written);
  }
  problems.sort((a, b) => a.line - b.line);
  return { blueprint: { nodes, wires }, problems, placed: statements.every((statement) => statement.at !== undefined) };
}
