import { plainLineOf } from "../../platform/markdown/plainLineOf";

export interface Talk {
  /** As the page writes it: a day, a month, a year, two of them, or a span. */
  readonly date: string;
  readonly title: string;
  readonly url?: string;
  /** The subject the page groups it under. */
  readonly about: string;
  /** The whole line, as plain words. */
  readonly said: string;
}

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/;

/**
 * The talks a page lists, a dated line each — `date :: **title**, where -- what` —
 * under the heading of its subject. Its link is the one on its title, or else
 * the first the line has; one into the site is given as a whole address.
 */
export function talksOn(markdown: string, origin: string): Talk[] {
  let about = "";
  return markdown.split("\n").flatMap((line) => {
    if (line.startsWith("## ")) about = plainLineOf(line);
    const at = line.indexOf(" :: ");
    if (at < 0) return [];
    const said = line.slice(at + 4);
    const bold = /\*\*(.+?)\*\*/.exec(said)?.[1] ?? "";
    const link = LINK.exec(bold)?.[1] ?? LINK.exec(said)?.[1];
    return [
      {
        date: line.slice(0, at).trim(),
        title: plainLineOf(bold),
        ...(link !== undefined && { url: link.startsWith("/") ? `${origin}${link}` : link }),
        about,
        said: plainLineOf(said).replace(/ -- /g, " — "),
      },
    ];
  });
}
