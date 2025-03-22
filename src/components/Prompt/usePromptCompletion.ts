"use client";

import { CurrentPath } from "@/features/shell/CurrentPath";
import { useInjection } from "@/utils/injector/useInjection";
import { type RefObject, useCallback, useMemo, useRef, useState } from "react";

export function usePromptCompletion(
  inputRef: RefObject<HTMLInputElement | null>,
) {
  const [hint, setHint] = useState("");
  const currentPath = useInjection(CurrentPath);
  const lastUnsuccessfulTabTs = useRef(0);

  const completeCommand = useCallback(() => {
    if (!inputRef.current) return;

    if (!isCaretAtEnd(inputRef.current)) return;
    const currentCommand = inputRef.current.value;
    const lastWord = currentCommand.split(" ").pop() ?? "";

    const currentDir = currentPath.getDirectory();
    const completion = currentDir?.complete(lastWord) ?? "";

    const isCompletionSuccessful = completion.length > lastWord.length;
    if (isCompletionSuccessful) {
      inputRef.current.value = `${currentCommand}${completion.slice(lastWord.length)}`;
      setCaretToEnd(inputRef.current);
    }

    if (!isCompletionSuccessful) {
      const now = Date.now();
      if (lastUnsuccessfulTabTs.current + 500 > now) {
        const completions = currentDir?.getCompletions(lastWord);
        if (completions) {
          setHint(completions.join(", "));
        } else {
          setHint("No completions");
        }
      }
      lastUnsuccessfulTabTs.current = now;
    }
  }, [inputRef, currentPath]);

  const clearHint = useCallback(() => {
    setHint("");
  }, []);

  return useMemo(
    () => ({ hint, clearHint, completeCommand }),
    [hint, clearHint, completeCommand],
  );
}

function setCaretToEnd(input: HTMLInputElement) {
  setTimeout(() => {
    input.setSelectionRange(input.value.length, input.value.length);
  }, 0);
}

function isCaretAtEnd(input: HTMLInputElement) {
  return input.selectionStart === input.value.length;
}
