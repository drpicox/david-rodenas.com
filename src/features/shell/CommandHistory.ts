export class CommandHistory {
  #commands: string[] = [""];
  #temporaryCommands: string[] = [""];
  #currentIndex = 0;

  addCommand(command: string) {
    this.#currentIndex = this.#commands.length - 1;
    this.#commands[this.#currentIndex] = command;
    this.#commands.push("");
    this.#currentIndex = this.#commands.length - 1;
    this.#temporaryCommands = this.#commands.slice();
  }

  getPreviousCommand(shownCommand: string): string {
    return this.#switchToCommand(this.#currentIndex - 1, shownCommand);
  }

  getNextCommand(shownCommand: string): string {
    return this.#switchToCommand(this.#currentIndex + 1, shownCommand);
  }

  #switchToCommand(index: number, shownCommand: string): string {
    if (index >= 0 && index < this.#commands.length) {
      this.#temporaryCommands[this.#currentIndex] = shownCommand;
      this.#currentIndex = index;
      return this.#temporaryCommands[index];
    }
    return shownCommand;
  }

  debug() {
    return `CommandHistory: ${JSON.stringify(this.#commands)}, CurrentIndex: ${this.#currentIndex}, TemporaryCommands: ${JSON.stringify(this.#temporaryCommands)}`;
  }
}
