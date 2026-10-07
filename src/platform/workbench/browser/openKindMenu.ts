import { el } from "../../browser/el";
import { coreNodes } from "../../blueprint/coreNodes";
import type { Kit } from "../../blueprint/kitOf";
import type { NodeKind } from "../../blueprint/NodeKind";
import { type Dragged, kindsFor, type Offer } from "../kindsFor";

/** The shelves in the order the menu shows them: the features' first, where the data comes in, then the ones every blueprint has. */
function shelvesOf(offers: readonly Offer[]): string[] {
  const core = new Set(coreNodes.map((kind) => kind.shelf));
  const shelves = [...new Set(offers.map((offer) => offer.kind.shelf))];
  return [...shelves.filter((shelf) => !core.has(shelf)), ...shelves.filter((shelf) => core.has(shelf))];
}

/** What a kind takes and gives, each pin in the colour of what flows along it: how it can be wired, seen before it is added. */
function pinsSaid(offer: Offer, kit: Kit): HTMLElement {
  const { kind } = offer;
  const pin = (name: string, type: string) => el("span", { class: "wb-menu-pin" }, el("span", { class: "wb-dot", style: `--pin: var(${kit.types.get(type)?.colour ?? "--dim"})`, "aria-hidden": "true" }), name);
  const listed = (pins: readonly { name: string; label: string; type: string }[]) => pins.flatMap((each, at) => [...(at > 0 ? [", "] : []), pin(each.label || each.name, each.type)]);
  const gives = kind.outputs.length > 0 ? ["gives ", ...listed(kind.outputs)] : kind.role === "paint" ? ["paints on the board"] : [];
  const takes = kind.role === "dial" ? ["turned by hand"] : kind.inputs.length > 0 ? ["takes ", ...listed(kind.inputs)] : ["takes nothing"];
  return el("p", { class: "wb-menu-pins" }, ...takes, ...(gives.length > 0 ? [" · ", ...gives] : []));
}

/** What each input is for, where there is room to say it: its own words, or that it is chosen when left to the node. */
function inputsSaid(offer: Offer, kit: Kit): HTMLElement {
  const said = (pin: NodeKind["inputs"][number]) => pin.hint ?? (pin.optional && typeof pin.editor === "object" && pin.editor.kind === "column" ? "chosen for you when left empty" : undefined);
  return el(
    "ul",
    { class: "wb-menu-inputs" },
    ...offer.kind.inputs.map((pin) => el("li", {}, el("span", { class: "wb-dot", style: `--pin: var(${kit.types.get(pin.type)?.colour ?? "--dim"})`, "aria-hidden": "true" }), pin.label || pin.name, said(pin) ? ` — ${said(pin)}` : "")),
  );
}

/**
 * The menu a node is added from, where it was asked for: a search, and every
 * kind that fits, shelf by shelf — or, typed into, the kinds that have the
 * words, best first. Pulled out of a pin with a wire, it offers only what the
 * wire could go into. Arrows move, Enter takes, Escape closes, and so does a
 * click anywhere else. What the lit kind does is said under the list; where
 * there is room, beside it, with what each of its inputs is for and the
 * examples it is found in, which are where to see it at work.
 */
export function openKindMenu(
  host: HTMLElement,
  kit: Kit,
  where: { readonly left: number; readonly top: number; readonly height?: number; readonly side?: boolean },
  dragged: Dragged | undefined,
  chose: (offer: Offer) => void,
  closed: () => void,
  seenIn: (kind: NodeKind) => readonly string[] = () => [],
): () => void {
  const search = el("input", { type: "search", placeholder: dragged ? `What does ${kit.types.get(dragged.type)?.label ?? dragged.type} go ${dragged.side === "output" ? "into" : "come from"}?` : "Search for a node…", "aria-label": "Search for a kind of node", spellcheck: false });
  const list = el("ul", { role: "listbox", "aria-label": "Kinds of node" });
  const about = el("div", { class: "wb-menu-about" });
  const height = where.height === undefined ? "" : ` max-height: ${Math.round(where.height)}px;`;
  const menu = el("div", { class: where.side ? "wb-menu side" : "wb-menu", role: "dialog", "aria-label": "Add a node", style: `left: ${Math.round(where.left)}px; top: ${Math.round(where.top)}px;${height}` }, search, list, about);
  let offers: Offer[] = [];
  let lit = 0;

  const light = (at: number) => {
    lit = Math.max(0, Math.min(offers.length - 1, at));
    for (const item of list.querySelectorAll<HTMLElement>("[role=option]")) item.setAttribute("aria-selected", String(Number(item.dataset["at"]) === lit));
    const offer = offers[lit];
    const seen = offer ? seenIn(offer.kind) : [];
    const more = offer && where.side ? [inputsSaid(offer, kit), ...(seen.length > 0 ? [el("p", { class: "wb-menu-seen" }, `In the examples: ${seen.join(", ")}.`)] : [])] : [];
    about.replaceChildren(...(offer ? [el("p", {}, offer.kind.summary), pinsSaid(offer, kit), ...more] : [el("p", {}, "Nothing fits. Try other words.")]));
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
  // The wheel scrolls the list, never the canvas under it, whatever the canvas does with a wheel.
  menu.addEventListener("wheel", (event) => event.stopPropagation());
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
