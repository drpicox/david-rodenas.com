export class CommandHistory {
  #commands: string[] = [""];
  #temporaryCommands: string[] = [""];
  #currentIndex = 0;

  addCommand(command: string) {
    const before = this.debug();
    this.#currentIndex = this.#commands.length - 1;
    this.#commands[this.#currentIndex] = command;
    this.#commands.push("");
    this.#currentIndex = this.#commands.length - 1;
    this.#temporaryCommands = this.#commands.slice();
    console.log(
      `Adding command: '${command}'\nBefore: ${before}\nAfter: ${this.debug()}`,
    );
  }

  getPreviousCommand(shownCommand: string): string {
    return this.#switchToCommand(this.#currentIndex - 1, shownCommand);
  }

  getNextCommand(shownCommand: string): string {
    return this.#switchToCommand(this.#currentIndex + 1, shownCommand);
  }

  #switchToCommand(index: number, shownCommand: string): string {
    const before = this.debug();
    if (index >= 0 && index < this.#commands.length) {
      this.#temporaryCommands[this.#currentIndex] = shownCommand;
      this.#currentIndex = index;
      console.log(
        `(A) Switching to command at index: ${index}, '${shownCommand}'\nBefore: ${before}\nAfter: ${this.debug()}`,
      );
      return this.#temporaryCommands[index];
    }

    console.log(
      `(B) Switching to command at index: ${index}, '${shownCommand}'\nBefore: ${before}\nAfter: ${this.debug()}`,
    );
    return shownCommand;
  }

  debug() {
    return `CommandHistory: ${JSON.stringify(this.#commands)}, CurrentIndex: ${this.#currentIndex}, TemporaryCommands: ${JSON.stringify(this.#temporaryCommands)}`;
  }
}
