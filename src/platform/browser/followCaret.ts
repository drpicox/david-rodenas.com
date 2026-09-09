/**
 * A terminal's cursor is a block, drawn where the caret is. The input hides its
 * own caret and this keeps two facts on the line around it: how many columns
 * in the caret stands, which the stylesheet turns into a position because the
 * font is monospace, and whether there is anything typed at all, which decides
 * whether the suggestion shows. Returns the hand that resyncs after the value
 * is set from code, where no key event says so.
 */
export function followCaret(input: HTMLInputElement, line: HTMLElement): () => void {
  const sync = () => {
    line.style.setProperty("--caret", String(input.selectionStart ?? input.value.length));
    line.classList.toggle("empty", input.value === "");
  };
  for (const event of ["input", "keyup", "click", "select", "focus"]) input.addEventListener(event, sync);
  sync();
  return sync;
}
