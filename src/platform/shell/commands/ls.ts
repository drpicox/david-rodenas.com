import type { Page } from "../../content/Page";
import { escapeHtml } from "../../markdown/escapeHtml";
import type { Command } from "../Command";
import type { Outcome } from "../Outcome";
import { resolvePath } from "../resolvePath";

/** Flags come off wherever they are; what is left is the path. */
function split(args: readonly string[]): { flags: string[]; path: string } {
  const flags = args.filter((arg) => arg.startsWith("-")).flatMap((arg) => arg.slice(1).split(""));
  const path = args.find((arg) => !arg.startsWith("-")) ?? ".";
  return { flags, path };
}

interface Entry {
  readonly mode: string;
  readonly name: string;
  readonly title: string;
  readonly summary: string;
  /** The link: a directory is a place to go; README.md is a command to run here. */
  readonly href: string;
  readonly run?: string;
}

function entriesOf(page: Page, children: readonly Page[], path: string): Entry[] {
  const here = path === "." ? "" : `${path.replace(/\/$/, "")}/`;
  return [
    { mode: "--r-", name: "README.md", title: page.title, summary: page.summary, href: page.route, run: `cat ${here}README.md` },
    ...children.map((child) => ({ mode: "dr-x", name: `${child.name}/`, title: child.title, summary: child.summary, href: child.route })),
  ];
}

function link(entry: Entry): string {
  const run = entry.run ? ` data-run="${escapeHtml(entry.run)}"` : "";
  return `<a href="${escapeHtml(entry.href)}"${run}>${escapeHtml(entry.name)}</a>`;
}

/**
 * Both forms of every line: plain for whoever reads text, linked for whoever
 * can click. Each name carries its title after a `#`, the way a shell comment
 * would: in the markup the title is a span the stylesheet cuts to whatever
 * width is left, so a narrow screen shows as much of it as fits and no line
 * ever wraps. Long adds the mode and the summary.
 */
function listing(entries: readonly Entry[], long: boolean): Outcome {
  const pad = (name: string) => " ".repeat(Math.max(0, 20 - name.length));
  const line = (entry: Entry) =>
    long ? `${entry.mode}  ${entry.name}${pad(entry.name)}  ${entry.title}${entry.summary ? ` — ${entry.summary}` : ""}` : `${entry.name}${pad(entry.name)}  # ${entry.title}`;
  const linked = (entry: Entry) =>
    long
      ? `<span class="line">${entry.mode}  ${link(entry)}${pad(entry.name)}  ${escapeHtml(entry.title)}${entry.summary ? `<span class="hint"> — ${escapeHtml(entry.summary)}</span>` : ""}</span>`
      : `<span class="line">${link(entry)}${pad(entry.name)}<span class="hint">  # ${escapeHtml(entry.title)}</span></span>`;
  const head = long ? [`total ${entries.length}`] : [];
  return {
    text: [...head, ...entries.map(line)].join("\n"),
    html: `<pre class="listing">${[...head.map((line) => `<span class="line">${line}</span>`), ...entries.map(linked)].join("")}</pre>`,
  };
}

export const ls: Command = {
  name: "ls",
  usage: "ls [-l] [path]",
  description: "list what a directory holds, each with its title; -l adds a line on each",
  run({ site, cwd }, args) {
    const { flags, path } = split(args);
    const unknown = flags.find((flag) => flag !== "l");
    if (unknown) return { text: `ls: -${unknown}: no such option. Try ls -l`, error: true };

    const route = resolvePath(cwd, path);
    const page = site.at(route);
    if (!page) return { text: `ls: ${path}: no such directory`, error: true };

    return listing(entriesOf(page, site.childrenOf(route), path), flags.includes("l"));
  },
};
