import { CurrentPath } from "@/features/shell/CurrentPath";
import { ShellCommandExecutor } from "@/features/shell/ShellCommandExecutor";
import { focusShellPrompt } from "@/features/shell/components/focusShellPrompt";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { AbstractSubject } from "@/utils/injector/AbstractSubject";

export class Shell extends AbstractSubject {
  readonly #commands: ShellCommandExecutor;
  readonly #terminalScreen: TerminalScreen;
  readonly #currentPath: CurrentPath;
  #running: Promise<void> | null = null;

  static $inject = [ShellCommandExecutor, TerminalScreen, CurrentPath];
  constructor(
    commands: ShellCommandExecutor,
    terminalScreen: TerminalScreen,
    currentPath: CurrentPath,
  ) {
    super();

    this.#commands = commands;
    this.#terminalScreen = terminalScreen;
    this.#currentPath = currentPath;
  }

  isRunning(): boolean {
    return this.#running === null;
  }

  async executeCommand(command: string): Promise<void> {
    await this.#running;

    const myRun = this.#executeCommand(command);
    const oldRun = this.#running;
    this.#running = myRun;
    if (oldRun) this.notify();

    await myRun;
    if (this.#running === myRun) {
      this.#running = null;
      this.notify();
    }
  }

  async #executeCommand(command: string): Promise<void> {
    this.#appendPrompt(command);
    for (const c of command.split(";")) {
      await this.#commands.executeCommand(c);
    }
  }

  #appendPrompt(command: string) {
    this.#terminalScreen.append(
      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div className="mt-4" onClick={focusShellPrompt}>
        {this.#currentPath.getPath()}
        <span className="prompt">$ </span>
        <span className="command">{command}</span>
      </div>,
    );
  }
}
