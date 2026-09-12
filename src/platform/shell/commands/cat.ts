import { renderMarkdown } from "../../markdown/renderMarkdown";
import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

/** Every directory holds one file, README.md, which is the page. `*` is that file too. */
function directoryOf(file: string): string {
  return file.replace(/(?:^|\/)(?:README\.md|\*)$/, "") || ".";
}

export const cat: Command = {
  name: "cat",
  usage: "cat <file>",
  description: "print a page, README.md or * for the one here",
  run({ site, cwd }, [file]) {
    if (!file) return { text: "cat: usage: cat <file>", error: true };
    const route = resolvePath(cwd, directoryOf(file));
    const page = site.at(route);
    if (!page || /\.md$/.test(file) !== /README\.md$/.test(file)) {
      return { text: `cat: ${file}: no such file`, error: true };
    }
    // The page printed is the page the reader is now looking at, so the address follows it.
    return { html: renderMarkdown(page.body), at: route };
  },
};
