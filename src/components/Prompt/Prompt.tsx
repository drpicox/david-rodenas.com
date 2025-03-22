"use client";

import { TextSpinner } from "@/components/Prompt/TextSpinner";
import { usePromptHistory } from "@/components/Prompt/usePromptHistory";
import { CurrentPath } from "@/features/shell/CurrentPath";
import { Shell } from "@/features/shell/Shell";
import { useInjection } from "@/utils/injector/useInjection";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePromptCompletion } from "./usePromptCompletion";

export function Prompt({
  onCommand,
}: { onCommand: (command: string) => void }) {
  const [fired, setFired] = useState(false);
  const [miniclip, setMiniclip] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const promptHistory = usePromptHistory(inputRef);
  const promptCompletion = usePromptCompletion(inputRef);
  const currentPath = useInjection(CurrentPath);
  const path = currentPath.getPath();
  const shell = useInjection(Shell);
  const isRunning = shell.isRunning();

  const runKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      promptCompletion.clearHint();
      if (e.key === "Enter") {
        const currentCommand = e.currentTarget.value;
        if (currentCommand.trim() !== "") {
          promptHistory.addCommand();
          onCommand(currentCommand);
        }
        e.currentTarget.value = "";
        setFired(true);
      }
      if (e.key === "ArrowUp") {
        promptHistory.getPreviousCommand();
      }
      if (e.key === "ArrowDown") {
        promptHistory.getNextCommand();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        promptCompletion.completeCommand();

        if (!fired && !e.currentTarget.value) {
          e.currentTarget.value = "help";
        }
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        const currentCommand = e.currentTarget.value;
        if (currentCommand) {
          setMiniclip(currentCommand);
        }
        e.currentTarget.value = "";
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        e.currentTarget.value += miniclip;
      }
    },

    [onCommand, promptHistory, promptCompletion, fired, miniclip],
  );

  useEffect(() => {
    if (isRunning && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isRunning]);

  if (!isRunning) {
    return <TextSpinner />;
  }

  return (
    <div className="mt-4">
      <div className="flex">
        {path}
        <span className="prompt whitespace-pre">$ </span>
        <input
          ref={inputRef}
          data-ref="prompt"
          type="text"
          placeholder={!fired ? "help" : ""}
          className="command text-light-gray border-none outline-none flex-1"
          onKeyDown={runKeyDown}
        />
      </div>
      {promptCompletion.hint && (
        <div className="hint">{promptCompletion.hint}</div>
      )}
    </div>
  );
}
