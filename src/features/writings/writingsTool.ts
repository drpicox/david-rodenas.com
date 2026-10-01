import type { Page } from "../../platform/content/Page";
import type { AgentTool } from "../../platform/plugin/AgentTool";
import { essaysOn } from "./essaysOn";
import { talksOn } from "./talksOn";

const KINDS = ["essays", "talks", "both"] as const;
const ESSAYS = "/essays/";
const TALKS = "/talks/";

const counted = (count: number, one: string) => `${count} ${one}${count === 1 ? "" : "s"}`;
/** Every word, at the start of a word somewhere in the text: "ai" finds "AI", and not "said". */
const says = (text: string, words: readonly string[]) => words.every((word) => new RegExp(`(^|[^\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "iu").test(text));
const yearsIn = (date: string) => (date.match(/\d{4}/g) ?? []).map(Number);

/** The first link a page gives before its first subject: where the rest of what it lists is. */
const firstLinkOf = (page: Page) => /\]\((https?:[^)\s]+)\)/.exec(page.body.split("\n## ")[0] ?? "")?.[1];

function yearOf(name: string, said: unknown): { year?: number } | { refused: string } {
  if (said === undefined) return {};
  const year = typeof said === "number" ? said : typeof said === "string" && /^\s*\d{4}\s*$/.test(said) ? Number(said) : Number.NaN;
  return Number.isInteger(year) ? { year } : { refused: `${name}: ${String(said)} is not a year` };
}

/**
 * What David has written and said, read off the two pages that list them —
 * so there is no second list to keep, and what the pages leave out, the tool
 * says where to find. The essays page names no dates, so asking for years is
 * asking for talks.
 */
export const writingsTool: AgentTool = {
  name: "writings",
  description:
    "The essays and talks this site lists — each with its title, link, the subject it is grouped under and what the page says of it; talks with their date — and where to find the ones it does not list. Nothing on the reader's screen moves.",
  inputSchema: {
    type: "object",
    properties: {
      kind: { type: "string", enum: KINDS, default: "both", description: "essays, talks, or both" },
      about: { type: "string", description: "words that must all be in its title, what is said of it, or its subject, e.g. tdd, technical debt, ai" },
      from: { type: "number", description: "the first year, for talks: the essays are not dated here, so asking for years leaves them out" },
      to: { type: "number", description: "the last year, for talks" },
    },
    required: [],
    additionalProperties: false,
  },
  readOnly: true,
  shows: false,
  answer(input, { site, origin }) {
    const kind = String(input["kind"] ?? "both");
    if (!(KINDS as readonly string[]).includes(kind)) return { refused: `kind: ${kind} is not one of essays, talks or both` };
    const from = yearOf("from", input["from"]);
    if ("refused" in from) return from;
    const to = yearOf("to", input["to"]);
    if ("refused" in to) return to;
    const dated = from.year !== undefined || to.year !== undefined;
    if (dated && kind === "essays") return { refused: `${from.year !== undefined ? "from" : "to"}: the essays are not dated here; years are for talks` };
    const words = String(input["about"] ?? "").toLowerCase().split(/\s+/).filter(Boolean);

    const essaysPage = kind !== "talks" && !dated ? site.at(ESSAYS) : undefined;
    const talksPage = kind !== "essays" ? site.at(TALKS) : undefined;
    const inYears = (date: string) => yearsIn(date).some((year) => year >= (from.year ?? -Infinity) && year <= (to.year ?? Infinity));
    const essays = essaysPage ? essaysOn(essaysPage.body).filter((essay) => says(`${essay.title} ${essay.said} ${essay.about}`, words)) : [];
    const talks = talksPage ? talksOn(talksPage.body, origin).filter((talk) => says(`${talk.title} ${talk.said} ${talk.about}`, words) && inYears(talk.date)) : [];

    const essaysAt = essaysPage && firstLinkOf(essaysPage);
    const more = {
      ...(essaysPage && essaysAt && { essays: { said: essaysPage.summary, url: essaysAt } }),
      ...(talksPage && { talks: { said: talksPage.summary, url: `${origin}${talksPage.route}` } }),
    };
    const listed = [essaysPage && counted(essays.length, "essay"), talksPage && counted(talks.length, "talk")].filter(Boolean).join(" and ");
    const rest = more.essays ? ` ${more.essays.said.replace(/\.$/, "")}: ${more.essays.url}` : more.talks ? ` The rest are told on ${more.talks.url}` : "";
    const route = essaysPage && !talksPage ? ESSAYS : talksPage && !essaysPage ? TALKS : undefined;
    return {
      summary: `${listed}${words.length > 0 ? ` about "${words.join(" ")}"` : ""}.${rest}`,
      data: { essays, talks, more },
      ...(route !== undefined && { route }),
    };
  },
};
