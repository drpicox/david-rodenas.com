import type { Page } from "../../platform/content/Page";
import type { Site } from "../../platform/content/Site";
import { plainLineOf } from "../../platform/markdown/plainLineOf";
import { foldedOf } from "./foldedOf";
import { wordStarts } from "./wordStarts";

/** A page found: where it is, what it is, the section it stands in, and the line of it that says the most of what was looked for. */
export interface Found {
  readonly route: string;
  readonly title: string;
  readonly summary: string;
  readonly section: string;
  readonly line: string;
}

/** A page as a search reads it, once: its prose — never a program's or a block of code — and every field folded. */
interface Read {
  readonly title: string;
  readonly summary: string;
  readonly route: string;
  readonly lines: readonly string[];
  readonly folded: readonly string[];
}

/**
 * A title says what a page is about; a summary, nearly as much; the address,
 * something; the text, a little for each time; and the word said whole, not
 * only as the start of a longer one, a little more.
 */
const WEIGHT = { title: 8, summary: 3, route: 2, said: 0.5, saidAtMost: 5, whole: 1 };
const WORDLIKE = /[\p{L}\p{N}]/u;
/** Long enough to read why a page was found, short enough for a line. */
const LONGEST = 180;

const read = new WeakMap<Page, Read>();

function proseOf(body: string): string[] {
  const lines: string[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) fenced = !fenced;
    else if (!fenced && !line.trimStart().startsWith("::")) lines.push(plainLineOf(line));
  }
  return lines.filter(Boolean);
}

function readOf(page: Page): Read {
  const known = read.get(page);
  if (known) return known;
  const lines = proseOf(page.body);
  const fresh = { title: foldedOf(page.title), summary: foldedOf(page.summary), route: foldedOf(page.route), lines, folded: lines.map(foldedOf) };
  read.set(page, fresh);
  return fresh;
}

const says = (text: string, word: string) => wordStarts(text, word).length > 0;
const saysWhole = (text: string, word: string) => wordStarts(text, word).some((at) => !WORDLIKE.test(text[at + word.length] ?? ""));

/** How well a page answers every word, or nothing when it does not say one of them. */
function scoreOf(page: Read, words: readonly string[]): number | null {
  let score = 0;
  for (const word of words) {
    const said = page.folded.reduce((times, line) => times + wordStarts(line, word).length, 0);
    const [title, summary, route] = [says(page.title, word), says(page.summary, word), says(page.route, word)];
    if (!title && !summary && !route && said === 0) return null;
    const whole = [page.title, page.summary, ...page.folded].some((text) => saysWhole(text, word));
    score += (title ? WEIGHT.title : 0) + (summary ? WEIGHT.summary : 0) + (route ? WEIGHT.route : 0) + Math.min(said, WEIGHT.saidAtMost) * WEIGHT.said + (whole ? WEIGHT.whole : 0);
  }
  return score;
}

/** The line of prose that says the most of the words, the first of them if several do; cut around the first word when it is long. */
function lineOf(page: Read, words: readonly string[], summary: string): string {
  const counts = page.folded.map((line) => words.filter((word) => says(line, word)).length);
  const best = counts.indexOf(Math.max(0, ...counts));
  if (best < 0 || counts[best] === 0) return summary;
  const line = page.lines[best]!;
  if (line.length <= LONGEST) return line;
  const first = Math.min(...words.flatMap((word) => wordStarts(page.folded[best]!, word).slice(0, 1)));
  const from = Math.max(0, line.lastIndexOf(" ", Math.max(0, first - LONGEST / 3)) + 1);
  const to = Math.min(line.length, from + LONGEST);
  return `${from > 0 ? "…" : ""}${line.slice(from, to).trim()}${to < line.length ? "…" : ""}`;
}

/**
 * The pages that say every word looked for — where a word of theirs starts
 * with it, whatever its case and accents — the best answer first: a word in
 * the title counts most, then in the summary, then in the address, a little
 * for each time the text says it, and a little more when it says it whole.
 */
export function pagesFound(site: Site, query: string): Found[] {
  const words = foldedOf(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return site.pages
    .flatMap((page) => {
      const score = scoreOf(readOf(page), words);
      return score === null ? [] : [{ page, score }];
    })
    .sort((a, b) => b.score - a.score || a.page.route.localeCompare(b.page.route))
    .map(({ page }) => ({
      route: page.route,
      title: page.title,
      summary: page.summary,
      section: page.route.split("/").filter(Boolean)[0] ?? "",
      line: lineOf(readOf(page), words, page.summary),
    }));
}
