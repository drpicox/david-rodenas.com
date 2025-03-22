export class ParsedCommand {
  readonly #commandName: string;
  readonly #getCommandUsage: () => string;

  #success = true;
  #error = "";
  #options: Record<string, boolean> = {};
  #arguments: Record<string, string> = {};

  constructor(commandName: string, getCommandUsage: () => string) {
    this.#commandName = commandName;
    this.#getCommandUsage = getCommandUsage;
  }

  isSuccess(): boolean {
    return this.#success;
  }

  setError(error: string): void {
    this.#success = false;
    this.#error = error;
  }

  getError(): string {
    return this.#error;
  }

  getErrorMessage() {
    return [
      `${this.#commandName}: ${this.#error}`,
      `usage: ${this.#getCommandUsage()}`,
    ].join("\n");
  }

  setOption(name: string, value: boolean): void {
    this.#options[name] = value;
  }

  getOption(name: string): boolean {
    return !!this.#options[name];
  }

  setArgument(name: string, value: string): void {
    this.#arguments[name] = value;
  }

  getArgument(name: string): string {
    return this.#arguments[name] as string;
  }
}
