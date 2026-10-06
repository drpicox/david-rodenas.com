import { slugOf } from "../markdown/slugOf";

/** One blueprint of several written together: what it is called, where a link finds it, what it is about, and its own lines. */
export interface Example {
  readonly title: string;
  readonly slug: string;
  readonly about: string;
  readonly text: string;
}

const TITLE = /^##\s+(.*)$/;
const WORDS = /^#(?!#)\s?(.*)$/;

/**
 * The blueprints a text holds, each under a `## Title` line — and the words
 * written under its title, in `#` lines, said of it — so that one place on a
 * page holds many, to open one at a time. A `#` line is a remark to the
 * language, so each one's lines are a blueprint as they stand. A text with no
 * title is one blueprint, with none.
 */
export function examplesOf(source: string): readonly Example[] {
  const written: { title: string; lines: string[] }[] = [{ title: "", lines: [] }];
  for (const line of source.split("\n")) {
    const title = TITLE.exec(line.trim());
    if (title) written.push({ title: title[1]?.trim() ?? "", lines: [] });
    else written.at(-1)?.lines.push(line);
  }
  return written.flatMap(({ title, lines }) => {
    const first = lines.findIndex((line) => line.trim() && !WORDS.test(line.trim()));
    if (!title && first === -1) return [];
    const words = first === -1 ? lines : lines.slice(0, first);
    const about = words.map((line) => WORDS.exec(line.trim())?.[1]?.trim()).filter(Boolean).join(" ");
    return [{ title, slug: slugOf(title), about, text: first === -1 ? "" : lines.slice(first).join("\n").trim() }];
  });
}
