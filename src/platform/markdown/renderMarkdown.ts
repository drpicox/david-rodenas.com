import { highlight } from "./highlight";
import { renderInline } from "./renderInline";

/**
 * A block is a run of lines that becomes one element. Splitting on blank lines
 * first means every rule below only has to look at lines it already owns.
 */
const ITEM = /^(?:[-*]|\d+\.)\s/;

/** A blank line inside a list is air, not an end: the list goes on if the next line is another item. */
function listGoesOn(current: string[], lines: string[], from: number): boolean {
  if (!ITEM.test(current[0] ?? "")) return false;
  const next = lines.slice(from).find((line) => line.trim() !== "");
  return next !== undefined && ITEM.test(next);
}

function blocksOf(markdown: string): string[][] {
  const blocks: string[][] = [];
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let current: string[] = [];
  let fenced = false;

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      fenced = !fenced;
      current.push(line);
      if (!fenced) {
        blocks.push(current);
        current = [];
      }
      return;
    }
    if (!fenced && line.trim() === "") {
      if (listGoesOn(current, lines, index + 1)) return;
      if (current.length) blocks.push(current);
      current = [];
      return;
    }
    current.push(line);
  });
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

/** A heading is one line, unless every line but the last asks for a break: then it is one heading, broken where it says. */
function heading(lines: string[]): string | null {
  const match = /^(#{1,4})\s+(.*)$/.exec(lines[0] ?? "");
  if (!match) return null;
  const breaks = lines.slice(0, -1).every((line) => / {2,}$/.test(line));
  if (!breaks) return null;
  const level = match[1]?.length ?? 1;
  const text = [match[2] ?? "", ...lines.slice(1)].join("\n");
  return `<h${level} id="${slugOf(text)}">${renderInline(text)}</h${level}>`;
}

/** A fence may name its language — ```js, ```html — and the block is coloured by it, at build time. */
function code(lines: string[]): string | null {
  if (!lines[0]?.startsWith("```")) return null;
  const language = lines[0].slice(3).trim();
  const body = lines.slice(1, -1).join("\n");
  return `<pre><code>${highlight(body, language)}</code></pre>`;
}

/** An indented line continues the item above it; the break it asked for is kept for renderInline. */
function itemsOf(lines: string[], marker: RegExp): string[] {
  const items: string[] = [];
  for (const line of lines) {
    if (marker.test(line)) items.push(line.replace(marker, ""));
    else if (items.length) items[items.length - 1] += `\n${line.trim()}`;
  }
  return items;
}

function list(lines: string[]): string | null {
  const first = lines[0] ?? "";
  const ordered = /^\d+\.\s/.test(first);
  const bulleted = /^[-*]\s/.test(first);
  if (!ordered && !bulleted) return null;
  const marker = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
  if (!lines.every((line) => marker.test(line) || /^\s/.test(line))) return null;
  const tag = ordered ? "ol" : "ul";
  const items = itemsOf(lines, marker)
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

/** `::name` — a place on the page where a program mounts. The words around it are still words. */
function app(lines: string[]): string | null {
  const match = /^::([a-z0-9-]+)$/.exec(lines[0] ?? "");
  if (!match || lines.length !== 1) return null;
  return `<div class="app" data-app="${match[1]}"></div>`;
}

function rule(lines: string[]): string | null {
  return lines.length === 1 && /^-{3,}$/.test(lines[0] ?? "") ? "<hr>" : null;
}

/** A line of backslashes is air: one paragraph's height for each. */
function space(lines: string[]): string | null {
  const match = lines.length === 1 && /^(\\+)$/.exec(lines[0] ?? "");
  return match ? `<div class="space" style="--n:${match[1]?.length ?? 1}"></div>` : null;
}

/** An image with nothing beside it is a figure; one among words stays in the paragraph. */
function figure(lines: string[]): string | null {
  const alone = lines.length === 1 && /^!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)$/.test(lines[0] ?? "");
  return alone ? `<figure>${renderInline(lines[0] ?? "")}</figure>` : null;
}

function paragraph(lines: string[]): string {
  return `<p>${renderInline(lines.join("\n"))}</p>`;
}

const RULES = [rule, space, heading, code, quote, app, figure, definitions, list];

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
