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
  /** The link: a directory is a place to go; README.md is a command to run here. */
  readonly href: string;
  readonly run?: string;
}

function entriesOf(page: Page, children: readonly Page[], path: string): Entry[] {
  const here = path === "." ? "" : `${path.replace(/\/$/, "")}/`;
  return [
    { mode: "--r-", name: "README.md", title: page.title, href: page.route, run: `cat ${here}README.md` },
    ...children.map((child) => ({ mode: "dr-x", name: `${child.name}/`, title: child.title, href: child.route })),
  ];
}

function link(entry: Entry): string {
  const run = entry.run ? ` data-run="${escapeHtml(entry.run)}"` : "";
  return `<a href="${escapeHtml(entry.href)}"${run}>${escapeHtml(entry.name)}</a>`;
}

/** Both forms of every line: plain for whoever reads text, linked for whoever can click. */
function listing(entries: readonly Entry[], long: boolean): Outcome {
  const line = (entry: Entry, name: string) => (long ? `${entry.mode}  ${name.padEnd(20)}  ${entry.title}` : name);
  const linked = (entry: Entry) =>
    long ? `${entry.mode}  ${link(entry)}${" ".repeat(Math.max(0, 20 - entry.name.length))}  ${escapeHtml(entry.title)}` : link(entry);
  const head = long ? [`total ${entries.length}`] : [];
  return {
    text: [...head, ...entries.map((entry) => line(entry, entry.name))].join("\n"),
    html: `<pre>${[...head, ...entries.map(linked)].join("\n")}</pre>`,
  };
}

export const ls: Command = {
  name: "ls",
  usage: "ls [-l] [path]",
  description: "list what a directory holds; -l says what each is",
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
