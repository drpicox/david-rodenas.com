/** Whether a key was pressed into something that takes words, where a key that means something elsewhere is only a letter. */
export function isTyping(event: Event): boolean {
  const target = event.target;
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable]") !== null;
}
