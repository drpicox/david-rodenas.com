import { escapeHtml } from "./escapeHtml";

/** The signs a keyboard has not got, by the way one types them. */
const SIGNS: Readonly<Record<string, string>> = {
  ">=": "≥",
  "<=": "≤",
  "!=": "≠",
  "->": "→",
  "...": "…",
  "*": "·",
  star: "∗",
  "-": "−",
  "'": "′",
  cdot: "·",
  inf: "∞",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  omega: "ω",
  Delta: "Δ",
  Sigma: "Σ",
};

/** Big operators take their limits under and over, not beside. */
const BIG: Readonly<Record<string, string>> = { sum: "∑", prod: "∏", int: "∫" };
/** Words that are operators, set upright like one. */
const WORDS = new Set(["max", "min", "lim", "log", "ln", "sin", "cos", "exp", "arg"]);

type Token = { kind: "name" | "number" | "sign" | "brace" | "script"; text: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\s+|\.\.\.|>=|<=|!=|->|\d+(?:\.\d+)?|[A-Za-z]+|[{}]|[_^]|./g;
  for (const [text] of source.matchAll(pattern)) {
    if (/^\s+$/.test(text)) continue;
    if (text === "{" || text === "}") tokens.push({ kind: "brace", text });
    else if (text === "_" || text === "^") tokens.push({ kind: "script", text });
    else if (/^\d/.test(text)) tokens.push({ kind: "number", text });
    else if (/^[A-Za-z]/.test(text)) tokens.push({ kind: "name", text });
    else tokens.push({ kind: "sign", text });
  }
  return tokens;
}

/**
 * A small notation for the few formulas the site has, turned into MathML at
 * build time — which every browser now draws on its own, so a formula costs
 * no script and no font. Names are italic, words upright, `frac{a}{b}`
 * stacks, `sum_{below}^{above}` sets its limits where they go, `_` and `^`
 * attach to anything, `text{…}` is a phrase, and the signs one cannot type
 * are spelt: `>=`, `->`, `inf`, `alpha`. One line is one displayed formula.
 */
export function renderMath(source: string): string {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<math display="block"><mrow>${new Parser(tokenize(line)).expression()}</mrow></math>`)
    .join("");
}

class Parser {
  private at = 0;
  /** Set by a big operator, so the scripts that follow go under and over it. */
  private limits = false;

  constructor(private readonly tokens: Token[]) {}

  /** Everything up to a closing brace or the end. */
  expression(): string {
    let out = "";
    while (this.at < this.tokens.length && this.peek()?.text !== "}" && this.peek()?.text !== ")") out += this.item();
    return out;
  }

  /** An atom, with whatever scripts hang off it, in either order. */
  private item(): string {
    let base = this.atom();
    const limits = this.limits;
    this.limits = false;
    let sub: string | null = null;
    let sup: string | null = null;
    while (this.peek()?.kind === "script") {
      const which = this.next().text;
      const script = `<mrow>${this.group()}</mrow>`;
      if (which === "_") sub = script;
      else sup = script;
    }
    const tag = sub && sup ? (limits ? "munderover" : "msubsup") : sub ? (limits ? "munder" : "msub") : limits ? "mover" : "msup";
    if (!sub && !sup) return base;
    return `<${tag}>${base}${sub ?? ""}${sup ?? ""}</${tag}>`;
  }

  private atom(): string {
    const token = this.next();
    if (token.kind === "brace" && token.text === "{") {
      const inner = this.expression();
      this.expect("}");
      return `<mrow>${inner}</mrow>`;
    }
    if (token.text === "(") {
      const inner = this.expression();
      if (this.peek()?.text === ")") this.at += 1;
      return `<mrow><mo>(</mo>${inner}<mo>)</mo></mrow>`;
    }
    if (token.kind === "number") return `<mn>${token.text}</mn>`;
    if (token.kind === "name") {
      if (token.text === "frac") return `<mfrac><mrow>${this.group()}</mrow><mrow>${this.group()}</mrow></mfrac>`;
      if (token.text === "sqrt") return `<msqrt>${this.group()}</msqrt>`;
      if (token.text === "text") return `<mtext>${escapeHtml(this.phrase())}</mtext>`;
      if (token.text in BIG) {
        this.limits = true;
        return `<mo>${BIG[token.text]}</mo>`;
      }
      if (WORDS.has(token.text)) return `<mo>${token.text}</mo>`;
      if (token.text in SIGNS) return /^[α-ωΑ-Ω]$/.test(SIGNS[token.text]!) ? `<mi>${SIGNS[token.text]}</mi>` : `<mo>${SIGNS[token.text]}</mo>`;
      return `<mi>${escapeHtml(token.text)}</mi>`;
    }
    return `<mo>${escapeHtml(SIGNS[token.text] ?? token.text)}</mo>`;
  }

  /** A braced expression, or the single atom that follows. */
  private group(): string {
    if (this.peek()?.text === "{") {
      this.next();
      const inner = this.expression();
      this.expect("}");
      return inner;
    }
    return this.atom();
  }

  /** The words inside text{…}, as they were typed, with their spaces back. */
  private phrase(): string {
    this.expect("{");
    const words: string[] = [];
    while (this.at < this.tokens.length && this.peek()?.text !== "}") words.push(this.next().text);
    this.expect("}");
    return words.join(" ");
  }

  private peek(): Token | undefined {
    return this.tokens[this.at];
  }

  private next(): Token {
    const token = this.tokens[this.at];
    if (!token) throw new Error("the formula ends early");
    this.at += 1;
    return token;
  }

  private expect(text: string): void {
    if (this.peek()?.text !== text) throw new Error(`expected ${text} in the formula`);
    this.at += 1;
  }
}
