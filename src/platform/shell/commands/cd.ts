import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

export const cd: Command = {
  name: "cd",
  usage: "cd [dir]",
  description: "go to a directory (the address follows)",
  run(context, [dir = "~"]) {
    const route = resolvePath(context.cwd, dir);
    const page = context.site.at(route);
    if (!page) return { text: `cd: ${dir}: no such directory`, error: true };
    // Through a link, the session lands where the page really is, as `cd -P` would.
    context.cwd = page.route;
    return { at: page.route };
  },
};
