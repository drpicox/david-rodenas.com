import { el } from "../../browser/el";
import { type Example, examplesOf } from "../../blueprint/examplesOf";
import type { Kit } from "../../blueprint/kitOf";
import { PROGRAM_ASKED } from "../../browser/PROGRAM_ASKED";
import { hashOf } from "../hashOf";
import { linkCodeOf } from "../linkCodeOf";
import { textOfLinkCode } from "../textOfLinkCode";
import { FilesInBrowser } from "./FilesInBrowser";
import { KeptBlueprints } from "./KeptBlueprints";
import { Workbench } from "./Workbench";

/** One for the page, and for every page after it: a station fetched for one blueprint is there for the next. */
let files: FilesInBrowser | undefined;

/** Told once an element comes near the screen; at once, in a browser that cannot tell. Returns how to stop watching. */
function wakeWhenNear(element: Element, wake: () => void): () => void {
  if (typeof IntersectionObserver !== "function") {
    wake();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      wake();
    },
    { rootMargin: "400px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** The heading a place stands under, which is what its blueprint is called when it does not say. */
function headingOver(element: Element): string | null {
  for (let at = element.previousElementSibling; at; at = at.previousElementSibling) if (/^H[1-4]$/.test(at.tagName)) return at.textContent;
  return null;
}

const fetched = (path: string) => fetch(path).then((response) => (response.ok ? response.text() : Promise.reject(new Error(`${path}: ${response.status}`))));

/**
 * A blueprint written in a page, made something to work on: the canvas and
 * the board in the still's place. A place may hold many, each under its
 * title: it opens on the first, or on the one the address names, and any
 * blueprint of the page can be opened in it. Each starts as the page wrote
 * it — or as a link to it carried it, or as the reader left it last time,
 * kept in their browser — and a link to it as it is can be copied at any
 * time. A link on the page to one of its blueprints lands on the place, and
 * opens it.
 */
export function mountWorkbench(kit: Kit): (host: HTMLElement) => () => void {
  return (host) => {
    files ??= new FilesInBrowser(fetched);
    const places = [...document.querySelectorAll<HTMLElement>('.app[data-app="blueprint"]')];
    host.id ||= `blueprint-${places.indexOf(host) + 1}`;
    const held = places.map((place, at) => examplesOf(place.dataset["source"] ?? "").map((example) => (example.title ? example : { ...example, title: headingOver(place) ?? `Blueprint ${at + 1}` })));
    const mine = held[places.indexOf(host)] ?? [];
    const named = () => mine.find((example) => example.slug && `#${example.slug}` === decodeURIComponent(window.location.hash));
    const asked = named();
    const code = window.location.hash === `#${host.id}` || asked ? new URLSearchParams(window.location.search).get("blueprint") : null;
    const linked = code ? textOfLinkCode(code) : null;
    const kept = new KeptBlueprints(() => window.localStorage);
    const keyOf = (example: Example) => `${window.location.pathname}#${hashOf(example.text)}`;
    const still = host.querySelector(".bp-board")?.innerHTML;
    const workbench = new Workbench({
      kit,
      files,
      examples: held.flat(),
      start: { ...(asked && { example: asked }), ...(linked && { text: linked, said: "Opened as a link carried it. Reset goes back to the page's own." }) },
      ...(still && { stillBoard: still }),
      own: { get: (example) => kept.get(keyOf(example)), set: (example, text) => (text === null ? kept.forget(keyOf(example)) : kept.set(keyOf(example), text)) },
      // The address says which is open, so that it is the one a reload, or a copied address, opens.
      opened: (example) => {
        if (mine.includes(example) && example.slug) window.history.replaceState(window.history.state, "", `${window.location.pathname}#${example.slug}`);
      },
      linkTo: (example, text) => `${window.location.origin}${window.location.pathname}?blueprint=${linkCodeOf(text)}#${(mine.includes(example) && example.slug) || host.id}`,
      copy: (text) => navigator.clipboard.writeText(text),
    });
    // Where a link to each of them lands: on the place, whichever of them is open.
    const anchors = mine.filter((example) => example.slug).map((example) => el("span", { id: example.slug, class: "wb-anchor" }));
    host.replaceChildren(...anchors, workbench.element);
    workbench.placed();
    // The browser went where the address points before the place was drawn; drawn, the place stands elsewhere.
    if (asked) document.getElementById(asked.slug)?.scrollIntoView?.();
    const stopWatching = wakeWhenNear(host, () => workbench.wake());
    const followed = () => {
      const example = named();
      if (example) workbench.open(example);
    };
    window.addEventListener("hashchange", followed);
    // An agent's blueprint, shown to the reader: the tool asks the place the way it asks a program's.
    const agentAsked = (event: Event) => {
      const text = (event as CustomEvent<Record<string, unknown>>).detail?.["text"];
      if (typeof text === "string") workbench.ask(text);
    };
    host.addEventListener(PROGRAM_ASKED, agentAsked);
    return () => {
      host.removeEventListener(PROGRAM_ASKED, agentAsked);
      window.removeEventListener("hashchange", followed);
      stopWatching();
      workbench.stop();
    };
  };
}
