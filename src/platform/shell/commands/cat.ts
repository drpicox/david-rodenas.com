import { renderMarkdown } from "../../markdown/renderMarkdown";
import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

/** Every directory holds one file, README.md, which is the page. `*` is that file too. */
function directoryOf(file: string): string {
  const directory = file.replace(/(?:^|\/)(?:README\.md|\*)$/, "");
  if (directory) return directory;
  // `/README.md` leaves nothing behind the slash it took; that nothing is the root, not here.
  return file.startsWith("/") ? "/" : ".";
}

export const cat: Command = {
  name: "cat",
  usage: "cat <file>",
  description: "print a page, README.md or * for the one here",
  run({ site, cwd }, [file]) {
    if (!file) return { text: "cat: usage: cat <file>", error: true };
    const page = site.at(resolvePath(cwd, directoryOf(file)));
    if (!page || /\.md$/.test(file) !== /README\.md$/.test(file)) {
      return { text: `cat: ${file}: no such file`, error: true };
    }
    return { view: page.route, html: renderMarkdown(page.body) };
  },
};
