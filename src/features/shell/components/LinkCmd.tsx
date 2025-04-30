"use client";

import { Shell } from "@/features/shell/Shell";
import { focusShellPrompt } from "@/features/shell/components/focusShellPrompt";
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
  const runCommand = inject([Shell], (shell) => async () => {
    await shell.executeCommand(command);
    if (focusPrompt) {
      focusShellPrompt();
    }
  });

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
