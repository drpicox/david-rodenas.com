import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";

export class ClearCommand extends AbstractCommand {
  static #parser = new CommandParser("clear", "Clear the terminal screen");

  #terminalScreen: TerminalScreen;

  static $inject = [TerminalScreen];
  constructor(terminalScreen: TerminalScreen) {
    super(ClearCommand.#parser, terminalScreen);
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(): Promise<void> {
    this.#terminalScreen.clear();
  }
}
