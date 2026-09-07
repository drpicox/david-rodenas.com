import { escapeHtml } from "./escapeHtml";
import { renderInline } from "./renderInline";

/**
 * A block is a run of lines that becomes one element. Splitting on blank lines
 * first means every rule below only has to look at lines it already owns.
 */
function blocksOf(markdown: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  let fenced = false;

  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (line.startsWith("```")) {
      fenced = !fenced;
      current.push(line);
      if (!fenced) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    if (!fenced && line.trim() === "") {
      if (current.length) blocks.push(current);
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) blocks.push(current);
  return blocks;
}

/** `## Title` becomes an `h2` with an id, so a link can point at it. */
export function slugOf(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function heading(lines: string[]): string | null {
  const match = /^(#{1,4})\s+(.*)$/.exec(lines[0] ?? "");
  if (!match || lines.length !== 1) return null;
  const level = match[1]?.length ?? 1;
  const text = match[2] ?? "";
  return `<h${level} id="${slugOf(text)}">${renderInline(text)}</h${level}>`;
}

function code(lines: string[]): string | null {
  if (!lines[0]?.startsWith("```")) return null;
  const body = lines.slice(1, -1).join("\n");
  return `<pre><code>${escapeHtml(body)}</code></pre>`;
}

function list(lines: string[]): string | null {
  const ordered = lines.every((line) => /^\d+\.\s/.test(line));
  const bulleted = lines.every((line) => /^[-*]\s/.test(line));
  if (!ordered && !bulleted) return null;
  const tag = ordered ? "ol" : "ul";
  const items = lines
    .map((line) => line.replace(/^(?:\d+\.|[-*])\s+/, ""))
    .map((item) => `<li>${renderInline(item)}</li>`)
    .join("");
  return `<${tag}>${items}</${tag}>`;
}

/** `Term :: what it is` — the shape the work pages are written in. */
function definitions(lines: string[]): string | null {
  if (!lines.every((line) => line.includes(" :: "))) return null;
  const rows = lines
    .map((line) => {
      const at = line.indexOf(" :: ");
      return [line.slice(0, at), line.slice(at + 4)] as const;
    })
    .map(([term, definition]) => `<dt>${renderInline(term)}</dt><dd>${renderInline(definition)}</dd>`)
    .join("");
  return `<dl>${rows}</dl>`;
}

function quote(lines: string[]): string | null {
  if (!lines.every((line) => line.startsWith(">"))) return null;
  const body = lines.map((line) => line.replace(/^>\s?/, "")).join(" ");
  return `<blockquote>${renderInline(body)}</blockquote>`;
}

function rule(lines: string[]): string | null {
  return lines.length === 1 && /^-{3,}$/.test(lines[0] ?? "") ? "<hr>" : null;
}

function paragraph(lines: string[]): string {
  return `<p>${renderInline(lines.join(" "))}</p>`;
}

const RULES = [rule, heading, code, quote, definitions, list];

/**
 * Markdown, reduced to what this site actually writes in. Anything wider than
 * this would be a dependency pretending to be a feature.
 */
export function renderMarkdown(markdown: string): string {
  return blocksOf(markdown)
    .map((lines) => {
      for (const applies of RULES) {
        const html = applies(lines);
        if (html !== null) return html;
      }
      return paragraph(lines);
    })
    .join("\n");
}
