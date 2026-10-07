import { el } from "../../browser/el";
import type { Example } from "../../blueprint/examplesOf";

/**
 * The page's blueprints, each by its title and the start of what it is
 * about, the one open marked: the one chosen is handed over, and the panel
 * closes. Returns how to close it without choosing.
 */
export function openExamples(host: HTMLElement, examples: readonly Example[], open: Example, take: (example: Example) => void): () => void {
  const list = el("ul", {});
  const close = el("button", { type: "button", class: "wb-help-close", "aria-label": "Close" }, "✕");
  const panel = el("div", { class: "wb-examples", role: "dialog", "aria-label": "The page's blueprints" }, close, el("p", {}, "Open one of the page's blueprints here. Your changes to each are kept apart; Reset goes back to the one open."), list);
  const shut = () => panel.remove();
  close.addEventListener("click", shut);
  for (const example of examples) {
    const choose = el("button", { type: "button", class: example === open ? "current" : undefined }, el("strong", {}, example.title), example.about ? el("span", {}, example.about) : "");
    choose.addEventListener("click", () => {
      shut();
      take(example);
    });
    list.append(el("li", {}, choose));
  }
  host.append(panel);
  (list.querySelector("button:not(.current)") as HTMLButtonElement | null)?.focus();
  return shut;
}
