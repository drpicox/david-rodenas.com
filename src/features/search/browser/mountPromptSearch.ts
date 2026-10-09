import { el } from "../../../platform/browser/el";
import { chosenOf } from "../../../platform/flags/browser/chosenOf";
import { isTyping } from "./isTyping";

/**
 * Searching at the prompt: `/` takes the reader to it with `search` typed,
 * and the key to press stands at the end of the prompt, to be pressed as
 * well. The rest is the shell's: the command lists what it finds on the
 * paper, as `grep` and `find` do. The key is taken before the terminal's own
 * listener, which would only type it.
 */
export function mountPromptSearch(): () => void {
  const form = document.querySelector<HTMLFormElement>(".terminal form.prompt");
  const input = form?.querySelector<HTMLInputElement>("input");
  if (!form || !input) return () => {};

  const begin = () => {
    input.focus();
    input.value = "search ";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const key = el("kbd", { class: "search-key", title: "search the site" }, "/ search");
  key.addEventListener("click", (event) => {
    event.stopPropagation();
    begin();
  });
  form.append(key);

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "/" || isTyping(event) || chosenOf("search") !== "prompt") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    begin();
  };
  window.addEventListener("keydown", onKey, { capture: true });
  return () => {
    window.removeEventListener("keydown", onKey, { capture: true });
    key.remove();
  };
}
