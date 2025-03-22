import { CatCommand } from "@/features/shell/commands/CatCommand";
import { CdCommand } from "@/features/shell/commands/CdCommand";
import { ClearCommand } from "@/features/shell/commands/ClearCommand";
import type { Command } from "@/features/shell/commands/Command";
import { LsCommand } from "@/features/shell/commands/LsCommand";
import { ThemeCommand } from "@/features/shell/commands/ThemeCommand";
import { HelpCommand } from "./HelpCommand";

export class ShellCommandDictionary {
  readonly #commands: Record<string, Command>;

  static $inject = [
    CatCommand,
    CdCommand,
    ClearCommand,
    HelpCommand,
    LsCommand,
    ThemeCommand,
  ];

  constructor(...commands: Command[]) {
    this.#commands = {};
    for (const command of commands) {
      this.#commands[command.name] = command;
    }
  }

  getCommand(commandName: string): Command | undefined {
    const commandInstance = this.#commands[commandName];
    return commandInstance;
  }

  getAllCommands() {
    return Object.values(this.#commands);
  }
}
