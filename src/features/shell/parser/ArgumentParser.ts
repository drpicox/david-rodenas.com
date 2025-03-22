import type { ParsedCommand } from "./ParsedCommand";

export interface ArgumentParserOptions {
  default?: string;
}

export class ArgumentParser {
  readonly #name: string;
  readonly #description: string;
  readonly #required: boolean;
  readonly #default: string | null = null;

  constructor(
    name: string,
    description: string,
    options: ArgumentParserOptions = {},
  ) {
    this.#description = description;

    switch (name[0]) {
      case "<":
        this.#name = name.slice(1, -1);
        this.#required = true;
        break;
      case "[":
        this.#name = name.slice(1, -1);
        this.#required = false;
        break;
      default:
        this.#name = name;
        this.#required = true;
        break;
    }

    if (options.default != null) {
      this.#default = options.default ?? null;
      this.#required = false;
    }
  }

  getHumanName(): string {
    return this.#required ? `<${this.#name}>` : `[${this.#name}]`;
  }

  getHumanDescription(): string {
    let description = this.#description;
    if (this.#default) {
      description += ` (default: ${this.#default})`;
    }
    return description;
  }

  setValueResult(parsingCommand: ParsedCommand, value: string) {
    parsingCommand.setArgument(this.#name, value);
  }

  isRequired(): boolean {
    return this.#required;
  }

  hasDefault(): boolean {
    return this.#default !== null;
  }

  getDefault(): string {
    if (this.#default === null) {
      throw new Error("No default value");
    }

    return this.#default;
  }
}
