import { CurrentPath } from "@/features/shell/CurrentPath";
import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { getDirectory } from "@/utils/content/directories";
import { navigatePath, toContentPath } from "@/utils/pathUtils";
import type { ParsedCommand } from "../parser/ParsedCommand";

export class CdCommand extends AbstractCommand {
  static #parser = new CommandParser("cd", "Change directory").argument(
    "[dir]",
    "The directory to change to",
    { default: "~" },
  );

  #currentPath: CurrentPath;
  #terminalScreen: TerminalScreen;

  static $inject = [CurrentPath, TerminalScreen];
  constructor(currentPath: CurrentPath, terminalScreen: TerminalScreen) {
    super(CdCommand.#parser, terminalScreen);

    this.#currentPath = currentPath;
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(parsedCommand: ParsedCommand): Promise<void> {
    const result = await this.#execute(parsedCommand.getArgument("dir"));
    if (result) this.#terminalScreen.append(result);
  }

  async #execute(dirName: string) {
    const targetPath = navigatePath(this.#currentPath.getPath(), dirName);
    const targetDirectory = getDirectory(toContentPath(targetPath));

    if (!targetDirectory) {
      return `No such directory: ${dirName}`;
    }
    this.#currentPath.setPath(targetPath);
    
    // Update browser URL to match the current path
    this.#updateBrowserUrl(targetPath);
  }
  
  #updateBrowserUrl(path: string) {
    if (typeof window === 'undefined') return;
    
    // Convert shell path to URL path
    let urlPath = path === '~' ? '/' : path.replace(/^~\//, '/');
    
    // Don't include README in URL
    urlPath = urlPath.replace(/\/README$/, '/');
    
    // Update browser URL without reloading the page
    window.history.pushState({}, '', urlPath);
  }
}
