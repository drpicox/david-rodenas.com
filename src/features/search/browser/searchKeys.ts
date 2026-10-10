/** Keys and words as a reader gives them, made for tests: a key pressed on something, and words typed into a box. */
export const searchKeys = {
  press(key: string, on: EventTarget = document.body, more: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...more });
    on.dispatchEvent(event);
    return event;
  },
  type(input: HTMLInputElement, words: string): void {
    input.value = words;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  },
};
