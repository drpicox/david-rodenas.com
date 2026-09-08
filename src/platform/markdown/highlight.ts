import { escapeHtml } from "./escapeHtml";

/**
 * The kinds of token a block of code is coloured by. The class names are
 * short because there are thousands of them in a page and they are not read.
 */
type Kind = "k" | "s" | "c" | "n" | "t" | "a";

const KEYWORDS = new Set(
  (
    "var let const function return if else for while do break continue new this " +
    "true false null undefined class extends import export from default async await " +
    "throw try catch finally typeof instanceof in of switch case delete void yield"
  ).split(" "),
);

function span(kind: Kind, text: string): string {
  return `<span class="hl-${kind}">${escapeHtml(text)}</span>`;
}

/** The end of a string that began at `start` with `quote`, honouring backslash escapes. */
function stringEnd(code: string, start: number, quote: string): number {
  for (let at = start + 1; at < code.length; at += 1) {
    if (code[at] === "\\") at += 1;
    else if (code[at] === quote) return at + 1;
  }
  return code.length;
}

/**
 * JavaScript, as far as the pages need it: comments, strings, numbers,
 * keywords. Everything else — names, punctuation — passes through escaped.
 */
function javascript(code: string): string {
  let out = "";
  let at = 0;
  while (at < code.length) {
    const rest = code.slice(at);
    let match: RegExpExecArray | null;
    if (rest.startsWith("//")) {
      const end = code.indexOf("\n", at);
      const stop = end < 0 ? code.length : end;
      out += span("c", code.slice(at, stop));
      at = stop;
    } else if (rest.startsWith("/*")) {
      const end = code.indexOf("*/", at + 2);
      const stop = end < 0 ? code.length : end + 2;
      out += span("c", code.slice(at, stop));
      at = stop;
    } else if (rest[0] === '"' || rest[0] === "'" || rest[0] === "`") {
      const stop = stringEnd(code, at, rest[0] ?? "");
      out += span("s", code.slice(at, stop));
      at = stop;
    } else if ((match = /^[A-Za-z_$][\w$]*/.exec(rest))) {
      const word = match[0];
      out += KEYWORDS.has(word) ? span("k", word) : escapeHtml(word);
      at += word.length;
    } else if ((match = /^\d+(?:\.\d+)?/.exec(rest))) {
      out += span("n", match[0]);
      at += match[0].length;
    } else {
      out += escapeHtml(rest[0] ?? "");
      at += 1;
    }
  }
  return out;
}

/**
 * HTML, as far as the pages need it: comments, tags, attributes and their
 * values. The words between tags are left as they are, braces and all, because
 * on this site they are usually a template expression and colouring it would
 * be a lie about what it is.
 */
function html(code: string): string {
  let out = "";
  let at = 0;
  while (at < code.length) {
    const rest = code.slice(at);
    if (rest.startsWith("<!--")) {
      const end = code.indexOf("-->", at + 4);
      const stop = end < 0 ? code.length : end + 3;
      out += span("c", code.slice(at, stop));
      at = stop;
      continue;
    }
    const tag = /^<(\/?)([A-Za-z][\w-]*)/.exec(rest);
    if (!tag) {
      const next = code.indexOf("<", at + 1);
      const stop = next < 0 ? code.length : next;
      out += escapeHtml(code.slice(at, stop));
      at = stop;
      continue;
    }
    out += `&lt;${tag[1]}${span("t", tag[2] ?? "")}`;
    at += tag[0].length;
    // Inside the tag: attributes, their values, and the closing bracket.
    while (at < code.length && code[at] !== ">") {
      const inside = code.slice(at);
      let match: RegExpExecArray | null;
      if ((match = /^\s+/.exec(inside))) {
        out += match[0];
        at += match[0].length;
      } else if ((match = /^[A-Za-z_:][\w:.-]*/.exec(inside))) {
        out += span("a", match[0]);
        at += match[0].length;
      } else if (inside[0] === "=" && (inside[1] === '"' || inside[1] === "'")) {
        const stop = stringEnd(code, at + 1, inside[1] ?? "");
        out += `=${span("s", code.slice(at + 1, stop))}`;
        at = stop;
      } else {
        out += escapeHtml(inside[0] ?? "");
        at += 1;
      }
    }
    if (code[at] === ">") {
      out += "&gt;";
      at += 1;
    }
  }
  return out;
}

/**
 * Colours a block of code by wrapping its tokens in spans, at build time.
 *
 * It knows the two languages the content is written in and nothing else: a
 * language it has not heard of comes back as plain escaped text, which is what
 * a diagram drawn in box characters wants. It is here, rather than a library
 * in the browser, because the page is meant to be finished before any script
 * arrives, and because a few dozen lines with tests are easier to trust than
 * a few thousand without.
 */
export function highlight(code: string, language: string): string {
  if (language === "js" || language === "javascript") return javascript(code);
  if (language === "html") return html(code);
  return escapeHtml(code);
}
