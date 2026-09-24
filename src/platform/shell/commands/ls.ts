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

/** `..` is the way back up, and it runs `cd` rather than linking: the paper stays, the way it does for every move the shell makes. Not at the root, which has no up. */
function entriesOf(page: Page, parent: Page | undefined, children: readonly Page[], path: string): Entry[] {
  const here = path === "." ? "" : `${path.replace(/\/$/, "")}/`;
  return [
    ...(parent ? [{ mode: "dr-x", name: "..", title: parent.title, summary: parent.summary, href: parent.route, run: `cd ${here}..` }] : []),
    { mode: "--r-", name: "README.md", title: page.title, summary: page.summary, href: page.route, run: `cat ${here}README.md` },
    // A link is marked the way ls -F marks one, and says where it leads; its entry goes straight there.
    ...children.map((child) =>
      child.link
        ? { mode: "lr-x", name: `${child.name}@`, title: `-> ${child.route}  ${child.title}`, summary: child.summary, href: child.route }
        : { mode: "dr-x", name: `${child.name}/`, title: child.title, summary: child.summary, href: child.route },
    ),
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
  const width = Math.max(...entries.map((entry) => entry.name.length));
  const pad = (name: string) => " ".repeat(width - name.length);
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
  usage: "ls [-lnr] [path]",
  description: "what a directory holds, in the site's own order; -l says more, -n sorts by name, -r reverses",
  run({ site, cwd }, args) {
    const { flags, path } = split(args);
    const unknown = flags.find((flag) => !["l", "n", "r"].includes(flag));
    if (unknown) return { text: `ls: -${unknown}: no such option. Try ls -l, -n by name, -r reversed`, error: true };

    const route = resolvePath(cwd, path);
    const page = site.at(route);
    if (!page) return { text: `ls: ${path}: no such directory`, error: true };

    const parent = page.parent === null ? undefined : site.at(page.parent);
    // The author's order is the default, as in the navigation: it says what comes first. -n is the alphabet, -r turns either round.
    const children = [...site.childrenOf(route)];
    if (flags.includes("n")) children.sort((a, b) => a.name.localeCompare(b.name));
    if (flags.includes("r")) children.reverse();
    return listing(entriesOf(page, parent, children, path), flags.includes("l"));
  },
};
