import { Markdown } from "@/components/Markdown";
import { CurrentPath } from "@/features/shell/CurrentPath";
import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { getFileByAbsolutePath } from "@/utils/content/files";
import type { ParsedCommand } from "../parser/ParsedCommand";
import { pathToUrlPath } from "@/utils/pathUtils";

export class CatCommand extends AbstractCommand {
  static #parser = new CommandParser(
    "cat",
    "Display the contents of a file",
  ).argument("<file>", "The file to display");

  #currentPath: CurrentPath;
  #terminalScreen: TerminalScreen;

  static $inject = [CurrentPath, TerminalScreen];
  constructor(currentPath: CurrentPath, terminalScreen: TerminalScreen) {
    super(CatCommand.#parser, terminalScreen);

    this.#currentPath = currentPath;
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(parsedCommand: ParsedCommand): Promise<void> {
    const result = await this.#execute(parsedCommand.getArgument("file"));
    this.#terminalScreen.append(result);
  }

  async #execute(fileName: string) {
    const absolutePath = this.#currentPath.getAbsolutePathOf(fileName);
    const file = getFileByAbsolutePath(absolutePath);
    if (!file) {
      return `No such file: ${fileName}`;
    }

    // Update browser URL to match the file being viewed
    this.#updateBrowserUrl(absolutePath, fileName);

    const content = await fetch(file.path).then((r) => r.text());

    // Handle markdown files with our component
    if (fileName.endsWith(".md")) {
      return <Markdown content={content} />;
    }

    // Handle other file types
    return <pre className="whitespace-pre text-wrap">{content}</pre>;
  }

  #updateBrowserUrl(absolutePath: string, fileName: string) {
    if (typeof window === "undefined") return;
    
    // Use the utility function to convert the path to a URL path
    const urlPath = pathToUrlPath(absolutePath, true);
    
    // Update browser URL without reloading the page
    window.history.pushState({}, "", urlPath);
  }
}
