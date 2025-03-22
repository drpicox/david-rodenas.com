import {
  ArgumentParser,
  type ArgumentParserOptions,
} from "@/features/shell/parser/ArgumentParser";
import { OptionParser } from "@/features/shell/parser/OptionParser";
import { ParsedCommand } from "@/features/shell/parser/ParsedCommand";

export class CommandParser {
  readonly #name: string;
  readonly #description: string;
  readonly #arguments: ArgumentParser[] = [];
  readonly #options: Record<string, OptionParser> = {};
  #parsingResult: ParsedCommand = null as unknown as ParsedCommand;

  constructor(name: string, description: string) {
    this.#name = name;
    this.#description = description;
  }

  getName(): string {
    return this.#name;
  }

  getDescription(): string {
    return this.#description;
  }

  argument(
    name: string,
    description: string,
    options?: ArgumentParserOptions,
  ): CommandParser {
    this.#arguments.push(new ArgumentParser(name, description, options));
    return this;
  }

  option(name: string, description: string): CommandParser {
    const option = new OptionParser(name, description);
    for (const flag of option.getFlags()) {
      this.#options[flag] = option;
    }
    return this;
  }

  getHelp(): string {
    return [
      `${this.#name}: ${this.#description}`,
      "",
      `Usage: ${this.#name}${this.#getOptionsUsage()}${this.#getArgumentsUsage()}`,
      "",
      "Arguments:",
      this.#getArgumentsHelp(),
      "",
      "Options:",
      this.#getOptionsHelp(),
      "",
    ]
      .filter((x) => typeof x === "string")
      .join("\n");
  }

  parse(command: string[]): ParsedCommand {
    this.#parsingResult = new ParsedCommand(
      this.#name,
      () =>
        `${this.#name}${this.#getOptionsUsage()}${this.#getArgumentsUsage()}`,
    );

    this.#parseShortOptions(command);
    this.#parseLongOptions(command);
    this.#parseArguments(command);

    return this.#parsingResult;
  }

  #parseShortOptions(command: string[]): void {
    for (const arg of command) {
      if (arg === "--") return;
      if (!arg.startsWith("-")) continue;
      if (arg.startsWith("--")) continue;

      for (const letter of arg.slice(1)) {
        const option = this.#options[`-${letter}`];
        if (!option) {
          this.#parsingResult.setError(`illegal option -${letter}`);
          return;
        }
        option.setValueResult(this.#parsingResult, true);
      }
    }
  }

  #parseLongOptions(command: string[]): void {
    for (const arg of command) {
      if (!arg.startsWith("--")) continue;
      if (arg === "--") return;

      const option = this.#options[arg];
      if (!option) {
        this.#parsingResult.setError(`illegal option ${arg}`);
        return;
      }
      option.setValueResult(this.#parsingResult, true);
    }
  }

  #parseArguments(command: string[]): void {
    let argIndex = 0;
    let optionsEscaped = false;
    for (const arg of command.slice(1)) {
      if (!optionsEscaped && arg === "--") {
        optionsEscaped = true;
        continue;
      }
      if (!optionsEscaped && arg.startsWith("-")) continue;

      if (argIndex >= this.#arguments.length) {
        this.#parsingResult.setError("too many arguments");
        return;
      }

      const argument = this.#arguments[argIndex];
      argument.setValueResult(this.#parsingResult, arg);
      argIndex++;
    }

    for (; argIndex < this.#arguments.length; argIndex++) {
      const argument = this.#arguments[argIndex];
      if (argument.isRequired()) {
        this.#parsingResult.setError(
          `missing required argument ${argument.getHumanName()}`,
        );
        return;
      }
      if (argument.hasDefault()) {
        argument.setValueResult(this.#parsingResult, argument.getDefault());
      }
    }
  }

  #getArgumentsUsage(): string {
    if (this.#arguments.length === 0) {
      return "";
    }

    return ` ${this.#arguments.map((arg) => arg.getHumanName()).join(" ")}`;
  }

  #getArgumentsHelp(): string {
    if (this.#arguments.length === 0) {
      return "  No arguments expected for this command.";
    }

    let padSize = 2;
    for (const arg of this.#arguments) {
      padSize = Math.max(padSize, arg.getHumanName().length);
    }

    return this.#arguments
      .map(
        (arg) =>
          `  ${arg.getHumanName().padEnd(padSize)}  ${arg.getHumanDescription()}`,
      )
      .join("\n");
  }

  #getOptionsUsage(): string {
    if (Object.keys(this.#options).length === 0) {
      return "";
    }

    const shortFlags = Object.keys(this.#options).filter(
      (flag) => flag.length === 2,
    );
    const shortLetters = shortFlags.map((flag) => flag[1]).sort();

    const longFlags = Object.keys(this.#options)
      .filter((flag) => flag.length > 2)
      .sort();

    let result = "";
    if (shortLetters.length > 0) {
      result += ` [-${shortLetters.join("")}]`;
    }
    result += longFlags.map((flag) => ` [--${flag.slice(2)}]`).join("");

    return result;
  }

  #getOptionsHelp(): string {
    const options = new Set(Object.values(this.#options));

    if (options.size === 0) {
      return "  No options available for this command.";
    }

    let padSize = 2;
    for (const option of options) {
      padSize = Math.max(padSize, option.getHumanName().length);
    }

    return Array.from(options)
      .map(
        (option) =>
          `  ${option.getHumanName().padEnd(padSize)}  ${option.getHumanDescription()}`,
      )
      .join("\n");
  }
}
