import type { Site } from "../../../platform/content/Site";
import { foldedOf } from "../foldedOf";
import { pagesFound } from "../pagesFound";
import { renderFound } from "../renderFound";
import { steppedTo } from "../steppedTo";

/**
 * What the header and the palette share: a box that lists the pages found as
 * the words are typed into it, the first of them chosen, the arrows moving
 * the choice and Enter following it — by a click, so the site moves to it as
 * it does for any link. Escape is the caller's, and so is what the empty box
 * says.
 */
export function chooser(site: Site, input: HTMLInputElement, found: HTMLElement, look: "lines" | "cards", empty: string): { show(): void; clear(): void } {
  let chosen = -1;
  const links = () => [...found.querySelectorAll<HTMLAnchorElement>("a")];
  const mark = () => links().forEach((link, at) => (link.closest("li") ?? link).classList.toggle("chosen", at === chosen));

  const show = () => {
    const words = foldedOf(input.value).split(/\s+/).filter(Boolean);
    found.innerHTML = words.length ? renderFound(pagesFound(site, input.value), words, look) : `<p class="none">${empty}</p>`;
    chosen = links().length ? 0 : -1;
    mark();
  };
  input.addEventListener("input", show);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      chosen = steppedTo(chosen, links().length, event.key);
      mark();
      links()[chosen]?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      links()[Math.max(0, chosen)]?.click();
    }
  });
  return {
    show,
    clear: () => {
      input.value = "";
      found.replaceChildren();
      chosen = -1;
    },
  };
}
