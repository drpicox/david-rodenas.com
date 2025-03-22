import { CurrentPath } from "@/features/shell/CurrentPath";
import { AbstractCommand } from "@/features/shell/commands/AbstractCommand";
import { LinkCat } from "@/features/shell/components/LinkCat";
import { LinkCd } from "@/features/shell/components/LinkCd";
import { CommandParser } from "@/features/shell/parser/CommandParser";
import type { ParsedCommand } from "@/features/shell/parser/ParsedCommand";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { getDirectory } from "@/utils/content/directories";

export class LsCommand extends AbstractCommand {
  static #parser = new CommandParser("ls", "List directory contents").argument(
    "[path]",
    "The path to list",
    { default: "." },
  );

  #currentPath: CurrentPath;
  #terminalScreen: TerminalScreen;

  static $inject = [CurrentPath, TerminalScreen];
  constructor(currentPath: CurrentPath, terminalScreen: TerminalScreen) {
    super(LsCommand.#parser, terminalScreen);

    this.#currentPath = currentPath;
    this.#terminalScreen = terminalScreen;
  }

  async executeSuccess(parsedCommand: ParsedCommand): Promise<void> {
    const result = await this.#execute(parsedCommand.getArgument("path"));
    this.#terminalScreen.append(result);
  }

  async #execute(path: string) {
    const absolutePath = this.#currentPath.getAbsolutePathOf(path);
    const dir = getDirectory(absolutePath);
    if (!dir) {
      return `No such directory: ${path}`;
    }

    return (
      <div className="whitespace-pre">
        <div key="header">
          total {dir.files.length + dir.directories.length}
        </div>
        {dir.hasParent() && (
          <div>
            dr-x <LinkCd path={dir.getParentPath()}>../</LinkCd>
          </div>
        )}
        {dir.directories.map((subdirectory) => (
          <div key={subdirectory.path}>
            dr-x <LinkCd path={subdirectory.path}>{subdirectory.name}/</LinkCd>
          </div>
        ))}
        {dir.files.map((file) => (
          <div key={file.path}>
            --r- <LinkCat path={file.path}>{file.name}</LinkCat>
          </div>
        ))}
      </div>
    );
  }
}
