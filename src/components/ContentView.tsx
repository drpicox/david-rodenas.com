"use client";

import { Prompt } from "@/components/Prompt";
import { CurrentPath } from "@/features/shell/CurrentPath";
import { Shell } from "@/features/shell/Shell";
import { TerminalScreen } from "@/features/terminal/TerminalScreen";
import { useInject } from "@/utils/injector/useInject";
import { useInjection } from "@/utils/injector/useInjection";
import { useCallback, useEffect, useRef } from "react";

export function ContentView({
  initialCommands,
  initialPath,
}: { initialCommands: string[]; initialPath: string }) {
  const terminal = useInjection(TerminalScreen);
  const inject = useInject();
  const bottomRef = useRef<HTMLDivElement>(null);

  const runCommand = useCallback(
    (command: string) =>
      inject([Shell], async (shell) => {
        await shell.executeCommand(command);
        setTimeout(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      }),
    [inject],
  );

  useEffect(() => {
    inject([CurrentPath, Shell], async (currentPath, shell) => {
      terminal.clear();
      if (initialPath) currentPath.changePath(initialPath);
      for (const command of initialCommands) {
        await shell.executeCommand(command);
      }
    });
  }, [inject, terminal, initialCommands, initialPath]);

  return (
    <>
      {terminal.getContent().map((output, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className="output">
          {output}
        </div>
      ))}

      <Prompt onCommand={runCommand} />
      <div ref={bottomRef} />
    </>
  );
}
