import { ShellCommandDictionary } from "@/features/shell/commands/ShellCommandDictionary";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";

export class ShellCommandExecutor {
  readonly #terminalScreen: TerminalScreen;
  readonly #shellCommandRegistry: ShellCommandDictionary;

  static $inject = [TerminalScreen, ShellCommandDictionary];
  constructor(
    terminalScreen: TerminalScreen,
    shellCommandRegistry: ShellCommandDictionary,
  ) {
    this.#terminalScreen = terminalScreen;
    this.#shellCommandRegistry = shellCommandRegistry;
  }

  async executeCommand(command: string): Promise<void> {
    const [name, ...args] = command.trim().split(/\s+/);
    const commandInstance = this.#shellCommandRegistry.getCommand(name);

    if (!commandInstance) {
      this.#terminalScreen.append(`Command not found: ${name}`);
    } else {
      await commandInstance.execute([name, ...args]);
    }
  }
}
