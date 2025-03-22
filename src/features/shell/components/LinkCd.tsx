import { CurrentPath } from "@/features/shell/CurrentPath";
import { Shell } from "@/features/shell/Shell";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { useInject } from "@/utils/injector/useInject";
import { toRelativePath } from "@/utils/pathUtils";

const style = {
  color: "var(--light-magenta)",
  cursor: "pointer",
};

export function LinkCd({
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

      const relativePath = toRelativePath(currentPath.getPath(), path);

      await shell.executeCommand(`cd ${relativePath}; cat README.md`);
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
