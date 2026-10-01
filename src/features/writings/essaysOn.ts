import { plainLineOf } from "../../platform/markdown/plainLineOf";

export interface Essay {
  readonly title: string;
  readonly url: string;
  /** The subject the page groups it under. */
  readonly about: string;
  /** The line the page says of it. */
  readonly said: string;
}

const LISTED = /^- \[(.+)\]\((\S+)\)\s*$/;

/** The essays a page lists: a link to each, the line under it, under the heading of its subject. */
export function essaysOn(markdown: string): Essay[] {
  const lines = markdown.split("\n");
  let about = "";
  return lines.flatMap((line, at) => {
    if (line.startsWith("## ")) about = plainLineOf(line);
    const listed = LISTED.exec(line);
    if (!listed) return [];
    const [, title = "", url = ""] = listed;
    return [{ title, url, about, said: plainLineOf(lines[at + 1] ?? "") }];
  });
}
