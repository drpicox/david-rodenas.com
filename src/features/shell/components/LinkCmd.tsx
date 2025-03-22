"use client";

import { CurrentPath } from "@/features/shell/CurrentPath";
import { Shell } from "@/features/shell/Shell";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { useInject } from "@/utils/injector/useInject";

export function LinkCmd({
  command,
  focusPrompt = false,
  children,
}: {
  command: string;
  focusPrompt?: boolean;
  children: React.ReactNode;
}) {
  const inject = useInject();
  const runCommand = inject(
    [CurrentPath, Shell, TerminalScreen],
    (currentPath, shell) => async () => {
      await shell.executeCommand(command);
      if (focusPrompt) {
        const input = document.querySelector(
          "input[data-ref=prompt]",
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <span
      className="bg-opacity-20 bg-gray-500 px-1 rounded cursor-pointer"
      onClick={runCommand}
    >
      {children}
    </span>
  );
}
