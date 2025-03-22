import type { ParsedCommand } from "./ParsedCommand";

export class OptionParser {
  readonly #description: string;
  readonly #flags: string[];

  constructor(name: string, description: string) {
    this.#description = description;
    this.#flags = name.split(",").map((flag) => flag.trim());
  }

  getFlags(): string[] {
    return this.#flags;
  }

  getHumanName(): string {
    return this.#flags.join(", ");
  }

  getHumanDescription(): string {
    return this.#description;
  }

  setValueResult(parsingResult: ParsedCommand, value: boolean) {
    for (const flag of this.#flags) {
      parsingResult.setOption(flag, value);
    }
  }
}
