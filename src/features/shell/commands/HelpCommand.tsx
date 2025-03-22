import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { ShellCommandDictionary } from "@/features/shell/commands/ShellCommandDictionary";
import { LinkCmd } from "@/features/shell/components/LinkCmd";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import type { ParsedCommand } from "@/features/shell/parser/ParsedCommand";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { Injector } from "@/utils/injector/Injector";

export class HelpCommand extends AbstractCommand {
  static #parser = new CommandParser(
    "help",
    "Display the help message",
  ).argument("[command]", "The command to display help for");

  #injector: Injector;
  #terminalScreen: TerminalScreen;

  static $inject = [Injector, TerminalScreen];
  constructor(injector: Injector, terminalScreen: TerminalScreen) {
    super(HelpCommand.#parser, terminalScreen);

    this.#injector = injector;
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(parsedCommand: ParsedCommand): Promise<void> {
    const command = parsedCommand.getArgument("command");
    if (command) return this.#showCommandHelp(command);
    return this.#showAllCommands();
  }

  async #showCommandHelp(commandName: string) {
    const commandDic = this.#injector.resolve(ShellCommandDictionary);
    const command = commandDic.getCommand(commandName);
    if (!command) {
      this.#terminalScreen.append(
        <pre>
          No such command: {commandName}
          {"\n\n"}
          Use {'"help"'} to see all available commands.
        </pre>,
      );
      return;
    }

    command.execute([commandName, "--help"]);
  }

  async #showAllCommands() {
    const commandDic = this.#injector.resolve(ShellCommandDictionary);
    const commands = commandDic.getAllCommands();

    let padLeft = 0;
    for (const command of commands) {
      padLeft = Math.max(padLeft, command.name.length);
    }

    this.#terminalScreen.append(
      <pre>
        Available commands:
        {"\n\n"}
        {commands.map((command) => {
          const { name } = command;
          const pad = " ".repeat(padLeft - name.length);
          return (
            <div key={name}>
              <LinkCmd command={`${name} --help`} focusPrompt={true}>
                {name}
              </LinkCmd>
              {pad}
              {"  - "}
              {command.description}
            </div>
          );
        })}
      </pre>,
    );
  }
}
