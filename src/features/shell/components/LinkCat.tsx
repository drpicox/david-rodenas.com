import { CurrentPath } from "@/features/shell/CurrentPath";
import { Shell } from "@/features/shell/Shell";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { useInject } from "@/utils/injector/useInject";
import { navigatePath, toRelativePath } from "@/utils/pathUtils";

const style = {
  color: "var(--light-blue)",
  cursor: "pointer",
};

export function LinkCat({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const inject = useInject();
  const runCommand = inject(
    [CurrentPath, Shell, TerminalScreen],
    (currentPath, shell, terminal) => async () => {
      terminal.clear();

      const shellPath = currentPath.getPath();
      const filePath = navigatePath(path, "..");
      const relativePath = toRelativePath(shellPath, filePath);
      const fileName = path.split("/").pop();

      let command = "";
      if (relativePath !== ".") {
        command += `cd ${relativePath}; `;
      }
      command += `cat ${fileName}`;
      await shell.executeCommand(command);
      await shell.executeCommand("ls");
    },
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <span style={style} onClick={runCommand}>
      {children}
    </span>
  );
}
