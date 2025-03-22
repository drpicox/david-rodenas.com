import { CommandHistory } from "@/features/shell/CommandHistory";
import { useInjection } from "@/utils/injector/useInjection";
import { type RefObject, useCallback, useMemo } from "react";

export function usePromptHistory(inputRef: RefObject<HTMLInputElement | null>) {
  const commandHistory = useInjection(CommandHistory);

  const addCommand = useCallback(() => {
    if (!inputRef.current) return;

    const currentCommand = inputRef.current?.value;
    commandHistory.addCommand(currentCommand);
  }, [inputRef, commandHistory]);

  const getPreviousCommand = useCallback(() => {
    if (!inputRef.current) return;

    const currentCommand = inputRef.current?.value;
    const previousCommand = commandHistory.getPreviousCommand(currentCommand);
    if (previousCommand !== currentCommand) {
      inputRef.current.value = previousCommand;
      setCaretToEnd(inputRef.current);
    }
  }, [inputRef, commandHistory]);

  const getNextCommand = useCallback(() => {
    if (!inputRef.current) return;

    const currentCommand = inputRef.current?.value;
    const nextCommand = commandHistory.getNextCommand(currentCommand);
    if (nextCommand !== currentCommand) {
      inputRef.current.value = nextCommand;
      setCaretToEnd(inputRef.current);
    }
  }, [inputRef, commandHistory]);

  return useMemo(
    () => ({ addCommand, getPreviousCommand, getNextCommand }),
    [addCommand, getPreviousCommand, getNextCommand],
  );
}

function setCaretToEnd(input: HTMLInputElement) {
  setTimeout(() => {
    input.setSelectionRange(input.value.length, input.value.length);
  }, 0);
}
