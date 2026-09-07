import type { Site } from "../content/Site";
import type { Command, ShellContext } from "./Command";
import { allCommands } from "./commands/allCommands";
import type { Outcome } from "./Outcome";
import { parseCommandLine } from "./parseCommandLine";
import { promptPath } from "./promptPath";
import { resolvePath } from "./resolvePath";

/**
 * The shell over the site. It has no screen and no keyboard: it takes a line
 * and returns what should happen, so the same shell answers in node and in the
 * browser, and the tests need neither.
 */
export class Shell {
  private readonly context: ShellContext;

  constructor(site: Site, cwd: string, commands: readonly Command[] = allCommands) {
    this.context = { site, cwd, commands };
  }

  get prompt(): string {
    return `${promptPath(this.context.cwd)} $`;
  }

  /** The page has moved on its own — a link was followed — and the shell follows it. */
  moveTo(route: string): boolean {
    if (!this.context.site.at(route)) return false;
    this.context.cwd = route;
    return true;
  }

  run(line: string): Outcome[] {
    const outcomes: Outcome[] = [];
    for (const [name = "", ...args] of parseCommandLine(line)) {
      const command = this.context.commands.find((candidate) => candidate.name === name);
      const outcome = command
        ? command.run(this.context, args)
        : { text: `${name}: command not found. Try help`, error: true };
      outcomes.push(outcome);
      if (outcome.error) break;
    }
    return outcomes;
  }

  /** The whole lines the one being typed could become. */
  complete(line: string): string[] {
    const words = line.split(/\s+/);
    const partial = words.pop() ?? "";
    const head = words.length === 0 ? "" : `${words.join(" ")} `;
    const candidates = words.length === 0 ? this.commandNames() : this.pathNames(partial);
    return candidates.filter((candidate) => candidate.startsWith(partial)).map((candidate) => head + candidate);
  }

  private commandNames(): string[] {
    return this.context.commands.map((command) => command.name).sort();
  }

  /** Names in the directory the partial path is inside, keeping the part already typed. */
  private pathNames(partial: string): string[] {
    const slash = partial.lastIndexOf("/");
    const directory = slash < 0 ? "." : partial.slice(0, slash + 1);
    const route = resolvePath(this.context.cwd, directory);
    if (!this.context.site.at(route)) return [];
    const prefix = slash < 0 ? "" : directory;
    const names = ["README.md", ...this.context.site.childrenOf(route).map((child) => `${child.name}/`)];
    return names.map((name) => prefix + name);
  }
}
