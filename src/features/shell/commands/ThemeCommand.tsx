import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import type { ParsedCommand } from "@/features/shell/parser/ParsedCommand";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";

export class ThemeCommand extends AbstractCommand {
  static #parser = new CommandParser(
    "theme",
    "Toggle between light and dark theme or set a specific theme",
  ).argument("[theme]", "The theme to set (light, dark, system/auto)");

  #terminalScreen: TerminalScreen;

  static $inject = [TerminalScreen];
  constructor(terminalScreen: TerminalScreen) {
    super(ThemeCommand.#parser, terminalScreen);
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(parsedCommand: ParsedCommand): Promise<void> {
    const result = await this.#execute(parsedCommand.getArgument("theme"));
    this.#terminalScreen.append(result);
  }

  async #execute(theme: string) {
    if (theme === "light") {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
      return "Theme set to light mode";
    }

    if (theme === "dark") {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
      return "Theme set to dark mode";
    }

    if (theme === "system" || theme === "auto") {
      document.documentElement.classList.remove("light-theme", "dark-theme");
      localStorage.removeItem("theme");
      return "Theme set to follow system preference";
    }

    if (!theme) {
      // Toggle between light and dark
      if (document.documentElement.classList.contains("dark-theme")) {
        document.documentElement.classList.remove("dark-theme");
        document.documentElement.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        return "Theme toggled to light mode";
      }

      if (document.documentElement.classList.contains("light-theme")) {
        document.documentElement.classList.remove("light-theme");
        document.documentElement.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
        return "Theme toggled to dark mode";
      }

      // No manual theme is set, so set to dark
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
      return "Theme toggled to dark mode";
    }
  }
}
