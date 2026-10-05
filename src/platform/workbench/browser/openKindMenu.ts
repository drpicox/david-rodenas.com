import { el } from "../../browser/el";
import { coreNodes } from "../../blueprint/coreNodes";
import type { Kit } from "../../blueprint/kitOf";
import { type Dragged, kindsFor, type Offer } from "../kindsFor";

/** The shelves in the order the menu shows them: the features' first, where the data comes in, then the ones every blueprint has. */
function shelvesOf(offers: readonly Offer[]): string[] {
  const core = new Set(coreNodes.map((kind) => kind.shelf));
  const shelves = [...new Set(offers.map((offer) => offer.kind.shelf))];
  return [...shelves.filter((shelf) => !core.has(shelf)), ...shelves.filter((shelf) => core.has(shelf))];
}

/**
 * The menu a node is added from, where it was asked for: a search, and every
 * kind that fits, shelf by shelf — or, typed into, the kinds that have the
 * words, best first. Pulled out of a pin with a wire, it offers only what the
 * wire could go into. Arrows move, Enter takes, Escape closes, and so does a
 * click anywhere else.
 */
export function openKindMenu(host: HTMLElement, kit: Kit, where: { readonly left: number; readonly top: number }, dragged: Dragged | undefined, chose: (offer: Offer) => void, closed: () => void): () => void {
  const search = el("input", { type: "search", placeholder: dragged ? `What does ${kit.types.get(dragged.type)?.label ?? dragged.type} go ${dragged.side === "output" ? "into" : "come from"}?` : "Search for a node…", "aria-label": "Search for a kind of node", spellcheck: false });
  const list = el("ul", { role: "listbox", "aria-label": "Kinds of node" });
  const about = el("p", { class: "wb-menu-about" });
  const menu = el("div", { class: "wb-menu", role: "dialog", "aria-label": "Add a node", style: `left: ${Math.round(where.left)}px; top: ${Math.round(where.top)}px` }, search, list, about);
  let offers: Offer[] = [];
  let lit = 0;

  const light = (at: number) => {
    lit = Math.max(0, Math.min(offers.length - 1, at));
    for (const item of list.querySelectorAll<HTMLElement>("[role=option]")) item.setAttribute("aria-selected", String(Number(item.dataset["at"]) === lit));
    const offer = offers[lit];
    about.textContent = offer ? offer.kind.summary : "Nothing fits. Try other words.";
    list.querySelector(`[data-at="${lit}"]`)?.scrollIntoView?.({ block: "nearest" });
  };
  const fill = () => {
    const found = kindsFor(kit, search.value, dragged);
    const query = search.value.trim();
    offers = query ? found : shelvesOf(found).flatMap((shelf) => found.filter((offer) => offer.kind.shelf === shelf));
    const items: HTMLElement[] = [];
    let shelf = "";
    offers.forEach((offer, at) => {
      if (!query && offer.kind.shelf !== shelf) {
        shelf = offer.kind.shelf;
        items.push(el("li", { class: "wb-shelf", role: "presentation" }, shelf));
      }
      items.push(el("li", { role: "option", "data-at": at, "data-kind": offer.kind.name, class: `wb-role-${offer.kind.role}` }, el("span", { class: "wb-glyph", "aria-hidden": "true" }), el("span", { class: "wb-offer" }, offer.kind.title)));
    });
    list.replaceChildren(...items);
    light(0);
  };
  const close = () => {
    menu.remove();
    host.ownerDocument.removeEventListener("pointerdown", outside, true);
    closed();
  };
  const take = (at: number) => {
    const offer = offers[at];
    if (!offer) return;
    close();
    chose(offer);
  };
  const outside = (event: Event) => {
    if (!menu.contains(event.target as Node)) close();
  };

  search.addEventListener("input", fill);
  search.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "ArrowDown") light(lit + 1);
    else if (event.key === "ArrowUp") light(lit - 1);
    else if (event.key === "Enter") take(lit);
    else if (event.key === "Escape") close();
    else return;
    event.preventDefault();
  });
  list.addEventListener("pointermove", (event) => {
    const item = (event.target as Element).closest<HTMLElement>("[role=option]");
    if (item && Number(item.dataset["at"]) !== lit) light(Number(item.dataset["at"]));
  });
  list.addEventListener("click", (event) => {
    const item = (event.target as Element).closest<HTMLElement>("[role=option]");
    if (item) take(Number(item.dataset["at"]));
  });
  host.append(menu);
  fill();
  search.focus();
  host.ownerDocument.addEventListener("pointerdown", outside, true);
  return close;
}
