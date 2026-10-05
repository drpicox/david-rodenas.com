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

const fetched = (path: string) => fetch(path).then((response) => (response.ok ? response.text() : Promise.reject(new Error(`${path}: ${response.status}`))));

/**
 * A blueprint written in a page, made something to work on: the canvas and
 * the board in the still's place. It starts as the page wrote it — or as a
 * link to it carried it, or as the reader left it last time, kept in their
 * browser — and a link to it as it is can be copied at any time.
 */
export function mountWorkbench(kit: Kit): (host: HTMLElement) => () => void {
  return (host) => {
    files ??= new FilesInBrowser(fetched);
    const places = [...document.querySelectorAll<HTMLElement>('.app[data-app="blueprint"]')];
    host.id ||= `blueprint-${places.indexOf(host) + 1}`;
    const example = host.dataset["source"] ?? "";
    const key = `${window.location.pathname}#${hashOf(example)}`;
    const kept = new KeptBlueprints(() => window.localStorage);
    const linked = window.location.hash === `#${host.id}` ? textOfLinkCode(new URLSearchParams(window.location.search).get("blueprint") ?? "") : null;
    const own = kept.get(key);
    const start = linked ? { text: linked, said: "Opened as a link carried it. Reset goes back to the page's own blueprint." } : own ? { text: own, said: "As you left it: your changes are kept in this browser. Reset goes back to the page's own blueprint." } : undefined;
    const still = host.querySelector(".bp-board")?.innerHTML;
    const workbench = new Workbench({
      kit,
      files,
      example,
      ...(start && { start }),
      ...(still && { stillBoard: still }),
      keep: (text) => (text === null ? kept.forget(key) : kept.set(key, text)),
      linkTo: (text) => `${window.location.origin}${window.location.pathname}?blueprint=${linkCodeOf(text)}#${host.id}`,
      copy: (text) => navigator.clipboard.writeText(text),
    });
    host.replaceChildren(workbench.element);
    workbench.placed();
    const stopWatching = wakeWhenNear(host, () => workbench.wake());
    // An agent's blueprint, shown to the reader: the tool asks the place the way it asks a program's.
    const asked = (event: Event) => {
      const text = (event as CustomEvent<Record<string, unknown>>).detail?.["text"];
      if (typeof text === "string") workbench.ask(text);
    };
    host.addEventListener(PROGRAM_ASKED, asked);
    return () => {
      host.removeEventListener(PROGRAM_ASKED, asked);
      stopWatching();
      workbench.stop();
    };
  };
}
