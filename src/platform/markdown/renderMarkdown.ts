import { renderFlow } from "./flow/renderFlow";
import { renderSlides } from "./slides/renderSlides";
import { renderMath } from "./renderMath";
import { escapeHtml } from "./escapeHtml";
import { highlight } from "./highlight";
import { renderBars } from "./renderBars";
import { renderInline } from "./renderInline";
import { slugOf } from "./slugOf";

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

const PLACE = /^::([a-z0-9-]+)((?:\s+--[a-z0-9-]+)*)$/;

/** A place on the page for a program, with the dials it is shown with and, when it was written in a fence, the lines it was handed. */
function place(name: string, options: string, source?: string): string {
  const dials = options.split(/\s+/).filter(Boolean).map((option) => option.slice(2));
  return `<div class="app" data-app="${name}"${dials.length ? ` data-dials="${dials.join(" ")}"` : ""}${source === undefined ? "" : ` data-source="${escapeHtml(source)}"`}></div>`;
}

/**
 * A fence may name its language — ```js, ```html — and the block is coloured
 * by it, at build time. Three languages are not code at all: ```flow is a
 * flowchart, ```bars a few numbers, and ```math a formula; the first two
 * come out as drawings and the third as MathML. And ```slides js is code in
 * frames, each one what the code became next, for the browser to play. A
 * fence named as a program's place, ```::blueprint, is that place, and its
 * lines are what the program is handed: a blueprint written in the page.
 */
function code(lines: string[]): string | null {
  if (!lines[0]?.startsWith("```")) return null;
  const language = lines[0].slice(3).trim();
  const body = lines.slice(1, -1).join("\n");
  const named = PLACE.exec(language);
  if (named) return place(named[1] ?? "", named[2] ?? "", body);
  if (language === "flow") return renderFlow(body);
  if (language === "bars") return renderBars(body);
  if (language === "math") return renderMath(body);
  if (language === "slides" || language.startsWith("slides ")) return renderSlides(body, language.slice("slides".length).trim());
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

/**
 * A table: every line a row between pipes, and the second nothing but
 * dashes, which is what makes the first a head. What a column aligns to is
 * the stylesheet's business, so the colons are read past. It is wrapped, so
 * that a table wider than a phone scrolls on its own and not the page.
 */
function table(lines: string[]): string | null {
  const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  if (lines.length < 2 || !lines.every((line) => line.trim().startsWith("|"))) return null;
  if (!cells(lines[1] ?? "").every((cell) => /^:?-+:?$/.test(cell))) return null;
  const row = (line: string, tag: "th" | "td") => `<tr>${cells(line).map((cell) => `<${tag}>${renderInline(cell)}</${tag}>`).join("")}</tr>`;
  return `<div class="table"><table><thead>${row(lines[0] ?? "", "th")}</thead><tbody>${lines.slice(2).map((line) => row(line, "td")).join("")}</tbody></table></div>`;
}

function quote(lines: string[]): string | null {
  if (!lines.every((line) => line.startsWith(">"))) return null;
  const body = lines.map((line) => line.replace(/^>\s?/, "")).join(" ");
  return `<blockquote>${renderInline(body)}</blockquote>`;
}

/**
 * `::name` — a place on the page where a program mounts. The words around it
 * are still words. `::name --dial --dial` shows it small: only those dials in
 * the reader's hand, the rest left where they start.
 */
function app(lines: string[]): string | null {
  const match = PLACE.exec(lines[0] ?? "");
  return match && lines.length === 1 ? place(match[1] ?? "", match[2] ?? "") : null;
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

const RULES = [rule, space, heading, code, table, quote, app, figure, definitions, list];

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
