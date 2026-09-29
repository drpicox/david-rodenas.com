import type { Site } from "../content/Site";
import type { Outcome } from "./Outcome";

/** Everything a command may look at or change. */
export interface ShellContext {
  readonly site: Site;
  cwd: string;
  readonly commands: readonly Command[];
}

export interface Command {
  readonly name: string;
  readonly usage: string;
  readonly description: string;
  run(context: ShellContext, args: readonly string[]): Outcome;
}
