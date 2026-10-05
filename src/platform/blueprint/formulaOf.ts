import type { Row } from "./Table";

/** A formula read: the columns it needs, and its value for a row, or nothing where it has none. */
export interface Formula {
  readonly names: readonly string[];
  at(row: Row): number | null;
}

type Value = (row: Row) => number;

const FUNCTIONS: Readonly<Record<string, (...values: number[]) => number>> = {
  abs: Math.abs,
  sqrt: Math.sqrt,
  log: Math.log,
  log10: Math.log10,
  exp: Math.exp,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
};
const TOKEN = /\s*(\d+\.?\d*(?:e[-+]?\d+)?|\.\d+|[A-Za-z_]\w*|[-+*/^(),×÷]|\S)/gy;

/** A value that is no number, raised in the middle of a formula and caught where it ends, so a row with nothing in a column gives nothing. */
class Nothing extends Error {}

const KNOWN = /^(?:[\d.]|[A-Za-z_]|[-+*/^(),×÷]$)/;

/** The formula's words and signs; a sign it does not know is said at once, rather than wherever the reading stumbles over it. */
function tokensOf(text: string): string[] {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(text); match; match = TOKEN.exec(text)) {
    const token = match[1] ?? "";
    if (!KNOWN.test(token)) throw new Error(`the formula has a ${token}, which it cannot read`);
    tokens.push(token);
  }
  return tokens;
}

/**
 * A formula a reader writes to make a new column out of others: numbers,
 * the names of columns, + − × ÷ and ^, brackets, and a few functions. Read
 * once, by recursive descent, into a function of a row — never handed to
 * eval, so a formula can only ever be arithmetic.
 */
export function formulaOf(text: string): Formula {
  const tokens = tokensOf(text);
  const names: string[] = [];
  let at = 0;
  const peek = () => tokens[at];
  const take = () => tokens[at++];

  const sum = (): Value => {
    let left = product();
    for (let sign = peek(); sign === "+" || sign === "-"; sign = peek()) {
      take();
      const [a, b] = [left, product()];
      left = sign === "+" ? (row) => a(row) + b(row) : (row) => a(row) - b(row);
    }
    return left;
  };
  const product = (): Value => {
    let left = unary();
    for (let sign = peek(); sign === "*" || sign === "/" || sign === "×" || sign === "÷"; sign = peek()) {
      take();
      const [a, b] = [left, unary()];
      left = sign === "*" || sign === "×" ? (row) => a(row) * b(row) : (row) => a(row) / b(row);
    }
    return left;
  };
  const unary = (): Value => {
    if (peek() === "-" || peek() === "+") {
      const sign = take();
      const value = unary();
      return sign === "-" ? (row) => -value(row) : value;
    }
    return power();
  };
  const power = (): Value => {
    const base = primary();
    if (peek() !== "^") return base;
    take();
    const exponent = unary();
    return (row) => base(row) ** exponent(row);
  };
  const primary = (): Value => {
    const token = take();
    if (token === undefined) throw new Error("the formula ends where a value was expected");
    if (/^[\d.]/.test(token)) {
      const number = Number(token);
      return () => number;
    }
    if (token === "(") {
      const inside = sum();
      if (take() !== ")") throw new Error("a bracket in the formula is not closed");
      return inside;
    }
    if (/^[A-Za-z_]/.test(token)) return peek() === "(" ? call(token) : column(token);
    throw new Error(`the formula has a ${token} where a value was expected`);
  };
  const call = (name: string): Value => {
    const apply = FUNCTIONS[name];
    if (!apply) throw new Error(`there is no function ${name}: there are ${Object.keys(FUNCTIONS).join(", ")}`);
    take();
    const args: Value[] = [];
    if (peek() !== ")") {
      args.push(sum());
      while (peek() === ",") {
        take();
        args.push(sum());
      }
    }
    if (take() !== ")") throw new Error(`${name}( is not closed`);
    return (row) => apply(...args.map((arg) => arg(row)));
  };
  const column = (name: string): Value => {
    if (!names.includes(name)) names.push(name);
    return (row) => {
      const value = row[name];
      if (typeof value !== "number") throw new Nothing();
      return value;
    };
  };

  const whole = sum();
  if (at < tokens.length) throw new Error(`the formula goes on after it should end, at ${tokens[at]}`);
  return {
    names,
    at: (row) => {
      try {
        const value = whole(row);
        return Number.isFinite(value) ? value : null;
      } catch (error) {
        if (error instanceof Nothing) return null;
        throw error;
      }
    },
  };
}
