/** A text as it stands after one keystroke, and where the caret is. */
export interface Keystroke {
  readonly text: string;
  readonly caret: number;
}

/**
 * The keystrokes from one text to the next, as a person would make them: what
 * both share at the start and at the end stays; what changed in between is
 * rubbed out from its end, then what replaces it is typed a letter at a time.
 */
export function typingSteps(from: string, to: string): Keystroke[] {
  let start = 0;
  while (start < from.length && start < to.length && from[start] === to[start]) start += 1;
  let end = 0;
  while (end < from.length - start && end < to.length - start && from[from.length - 1 - end] === to[to.length - 1 - end]) end += 1;
  const head = from.slice(0, start);
  const tail = from.slice(from.length - end);
  const gone = from.slice(start, from.length - end);
  const come = to.slice(start, to.length - end);
  const steps: Keystroke[] = [];
  for (let length = gone.length - 1; length >= 0; length -= 1) steps.push({ text: head + gone.slice(0, length) + tail, caret: start + length });
  for (let length = 1; length <= come.length; length += 1) steps.push({ text: head + come.slice(0, length) + tail, caret: start + length });
  return steps;
}
