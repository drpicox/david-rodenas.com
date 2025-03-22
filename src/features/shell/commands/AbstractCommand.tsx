import type { Command } from "@/features/shell/commands/Command";
import type { CommandParser } from "@/features/shell/parser/CommandParser";
import type { ParsedCommand } from "@/features/shell/parser/ParsedCommand";
import type { TerminalScreen } from "@/features/terminal/TerminalScreen";

export abstract class AbstractCommand implements Command {
  readonly #parser: CommandParser;
  readonly #terminalScreen: TerminalScreen;

  constructor(parser: CommandParser, terminalScreen: TerminalScreen) {
    this.#parser = parser;
    this.#terminalScreen = terminalScreen;

    this.#parser.option("--help", "Display this help message");
  }

  get name(): string {
    return this.#parser.getName();
  }

  get description(): string {
    return this.#parser.getDescription();
  }

  execute(command: string[]): Promise<void> {
    const parsedCommand = this.#parser.parse(command);
    if (parsedCommand.getOption("--help")) {
      this.#terminalScreen.append(<pre>{this.#parser.getHelp()}</pre>);
      return Promise.resolve();
    }

    if (!parsedCommand.isSuccess()) {
      this.#terminalScreen.append(<pre>{parsedCommand.getErrorMessage()}</pre>);
      return Promise.resolve();
    }

    return this.executeSuccess(parsedCommand);
  }

  protected abstract executeSuccess(
    parsedCommand: ParsedCommand,
  ): Promise<void>;
}
