import { el } from "../../../platform/browser/el";
import type { Site } from "../../../platform/content/Site";
import { chosenOf } from "../../../platform/flags/browser/chosenOf";
import { chooser } from "./chooser";
import { isTyping } from "./isTyping";

/** A magnifying glass, drawn in the ink of the button it is in. */
const GLASS = '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 10l4.2 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

/**
 * Searching in a palette, as the sites of documentation do: a box over the
 * page, opened by the glass beside the theme's half-moon, by `/`, or by ⌘K —
 * by Ctrl+K too, except in the prompt, where it cuts the rest of the line —
 * that lists the pages found as cards as the words are typed. Escape, a click
 * outside it, or a page chosen closes it, and the reader is put back where
 * they were.
 */
export function mountPaletteSearch(site: Site): () => void {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header) return () => {};

  const opener = el("button", { class: "search-open", type: "button", "aria-label": "Search the site", title: "search  / or ⌘K" });
  opener.innerHTML = GLASS;
  const toggle = header.querySelector(".theme-toggle");
  if (toggle) toggle.before(opener);
  else header.append(opener);

  const input = el("input", { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Search the site" });
  const found = el("div", { class: "palette-found", "aria-live": "polite" });
  const box = el(
    "div",
    { class: "palette-box" },
    el("p", { class: "ran palette-line" }, el("span", { class: "ps1" }, "$"), " search ", input),
    found,
    el("p", { class: "palette-keys" }, "↑↓ to choose · ↵ to go · esc to close"),
  );
  const palette = el("div", { class: "palette", role: "dialog", "aria-modal": "true", "aria-label": "Search the site", hidden: true }, box);
  document.body.append(palette);
  const list = chooser(site, input, found, "cards", "Every page that says the words, as they are typed.");

  let back: HTMLElement | null = null;
  const open = () => {
    if (!palette.hidden) return;
    back = document.activeElement as HTMLElement | null;
    palette.hidden = false;
    input.focus();
    list.show();
  };
  const close = () => {
    if (palette.hidden) return;
    palette.hidden = true;
    list.clear();
    back?.focus?.();
  };
  opener.addEventListener("click", open);
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
  palette.addEventListener("click", (event) => {
    if (event.target === palette) close();
    else if ((event.target as Element).closest("a")) setTimeout(close);
  });
  const onKey = (event: KeyboardEvent) => {
    if (chosenOf("search") !== "palette") return;
    const combo = event.key.toLowerCase() === "k" && (event.metaKey || (event.ctrlKey && !isTyping(event)));
    const slash = event.key === "/" && !isTyping(event);
    if (!combo && !slash) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  };
  window.addEventListener("keydown", onKey, { capture: true });
  return () => {
    window.removeEventListener("keydown", onKey, { capture: true });
    opener.remove();
    palette.remove();
  };
}
