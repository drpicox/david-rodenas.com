import type { Command } from "../Command";
import { resolvePath } from "../resolvePath";

export const cd: Command = {
  name: "cd",
  usage: "cd [dir]",
  description: "go to a directory (the page follows)",
  run(context, [dir = "~"]) {
    const route = resolvePath(context.cwd, dir);
    if (!context.site.at(route)) return { text: `cd: ${dir}: no such directory`, error: true };
    context.cwd = route;
    return { navigate: route };
  },
};
