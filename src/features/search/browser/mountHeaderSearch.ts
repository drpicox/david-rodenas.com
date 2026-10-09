import { el } from "../../../platform/browser/el";
import type { Site } from "../../../platform/content/Site";
import { chosenOf } from "../../../platform/flags/browser/chosenOf";
import { chooser } from "./chooser";
import { isTyping } from "./isTyping";

/**
 * Searching in the header: the session that opens every page with `ls`
 * becomes `find`, and what it finds is printed where `ls` printed the
 * directories, as the words are typed — nothing opens over the page, the
 * header only says another command. `/`, or the find beside `ls`, starts it;
 * Escape, a page chosen, or a click elsewhere puts `ls` back.
 */
export function mountHeaderSearch(site: Site): () => void {
  const session = document.querySelector<HTMLElement>(".site-header .session");
  const ran = session?.querySelector<HTMLElement>(":scope > p.ran");
  if (!session || !ran) return () => {};

  const opener = el("button", { class: "find-open", type: "button", title: "find a page" }, "/ find");
  const input = el("input", { type: "text", class: "find-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Find a page" });
  const line = el("p", { class: "ran find-line" }, el("a", { class: "brand", href: "/" }, "@drpicox"), el("span", { class: "ps1" }, "~ $"), el("span", {}, "find"), input);
  const found = el("div", { class: "found-here", "aria-live": "polite" });
  ran.append(" ", opener);
  session.append(line, found);
  const list = chooser(site, input, found, "lines", "Every page that says the words, as they are typed.");

  const open = () => {
    session.classList.add("finding");
    input.focus();
    list.show();
  };
  const close = () => {
    session.classList.remove("finding");
    list.clear();
  };
  opener.addEventListener("click", open);
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
  // A page chosen is followed first, by the site's own handling of the click; ls comes back after.
  found.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) setTimeout(close);
  });
  const elsewhere = (event: MouseEvent) => {
    if (session.classList.contains("finding") && !session.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "/" || isTyping(event) || chosenOf("search") !== "header") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  };
  document.addEventListener("click", elsewhere);
  window.addEventListener("keydown", onKey, { capture: true });
  return () => {
    window.removeEventListener("keydown", onKey, { capture: true });
    document.removeEventListener("click", elsewhere);
    session.classList.remove("finding");
    opener.remove();
    line.remove();
    found.remove();
  };
}
