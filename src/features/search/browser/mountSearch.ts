import { el } from "../../../platform/browser/el";
import type { Site } from "../../../platform/content/Site";
import { chooser } from "./chooser";
import { isTyping } from "./isTyping";

/**
 * Searching the site from the header: the session that opens every page with
 * `ls` says `search`, and what it finds is printed where `ls` printed the
 * directories, as the words are typed — and the same line is written at the
 * prompt below as it is typed above, because it is the one command, seen in
 * two places. `/`, the search beside `ls`, or the key at the end of the prompt
 * starts it; Enter follows the page chosen; Escape, a page followed, or a
 * click elsewhere puts `ls` back, and takes the line from the prompt below
 * unless the reader went down to it.
 */
export function mountSearch(site: Site): () => void {
  const session = document.querySelector<HTMLElement>(".site-header .session");
  const ran = session?.querySelector<HTMLElement>(":scope > p.ran");
  if (!session || !ran) return () => {};
  const prompt = document.querySelector<HTMLInputElement>(".terminal form.prompt input");

  const opener = el("button", { class: "search-open", type: "button", title: "search the site" }, el("kbd", {}, "/"), " search");
  const input = el("input", { type: "text", class: "search-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Search the site" });
  const line = el("p", { class: "ran search-line" }, el("a", { class: "brand", href: "/" }, "@drpicox"), el("span", { class: "ps1" }, "~ $"), el("span", {}, "search"), input);
  const found = el("div", { class: "found-here", "aria-live": "polite" });
  const key = el("button", { class: "search-key", type: "button", title: "search the site" }, el("kbd", {}, "/"), " search");
  ran.append(" ", opener);
  session.append(line, found);
  prompt?.form?.append(key);
  const list = chooser(site, input, found, "Every page that says the words, as they are typed.");

  // The prompt below is told by a keyup, which redraws its line; an input event would also scroll the page down to it.
  let written = "";
  const writeBelow = (words: string) => {
    if (!prompt) return;
    prompt.value = words;
    prompt.dispatchEvent(new KeyboardEvent("keyup"));
    written = words;
  };

  const open = () => {
    session.classList.add("searching");
    window.scrollTo({ top: 0 });
    input.focus({ preventScroll: true });
    list.show();
    writeBelow(`search ${input.value}`);
  };
  const close = (keepBelow = false) => {
    if (!session.classList.contains("searching")) return;
    session.classList.remove("searching");
    list.clear();
    if (!keepBelow && prompt?.value === written) writeBelow("");
  };

  input.addEventListener("input", () => writeBelow(`search ${input.value}`));
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
  opener.addEventListener("click", open);
  key.addEventListener("click", (event) => {
    event.stopPropagation();
    open();
  });
  // A page chosen is followed first, by the site's own handling of the click; ls comes back after.
  found.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) setTimeout(() => close());
  });
  const elsewhere = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!session.contains(target)) close(prompt?.form?.contains(target) ?? false);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "/" || isTyping(event) || event.metaKey || event.ctrlKey || event.altKey) return;
    // Taken before the terminal's own listener, which would only type it at the prompt.
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  };
  document.addEventListener("click", elsewhere);
  window.addEventListener("keydown", onKey, { capture: true });
  return () => {
    window.removeEventListener("keydown", onKey, { capture: true });
    document.removeEventListener("click", elsewhere);
    close();
    opener.remove();
    line.remove();
    found.remove();
    key.remove();
  };
}
