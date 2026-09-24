import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import { Fibergochi } from "../Fibergochi";
import type { FibergochiState } from "../FibergochiState";
import { readKept } from "../readKept";
import { renderFibergochi } from "../renderFibergochi";
import { Sprite } from "../Sprite";

const KEY = "fibergochi";
/**
 * 1999 asked for a step every ten milliseconds, too fast to look after.
 * At half a second, a day lasts twenty-four seconds and a term ten minutes.
 */
const PACE = 500;
/** Kept every ten steps of the clock, and whenever it is asked something. */
const KEEP_EVERY = 10;

/**
 * The Fibergochi in its egg, alive while it can be seen: kept in this
 * browser, as the cookie of 1999 kept it, and found again on the next visit.
 * A beat copies across only what moves, so a key being pressed keeps the
 * focus; anything that opens or closes a box writes it all again.
 */
export function mountFibergochi(host: HTMLElement): () => void {
  let fibergochi = new Fibergochi(Math.random, load() ?? {});
  let running = true;
  let confirmingNew = false;
  let picked: string | null = null;
  let steps = 0;
  const seen = watchOnScreen(host);
  const view = document.createElement("div");
  // Every drawing, asked for at once and kept where nobody sees it, so a new frame is never waited for in view.
  const drawings = el(
    "div",
    { hidden: true },
    ...Sprite.everyImage.map((image) => el("img", { src: `/fibergochi/${image}.gif`, alt: "", width: 50, height: 40 })),
  );

  const render = () => renderFibergochi(fibergochi, { running, confirmingNew, picked });

  function draw(): void {
    const focused = document.activeElement instanceof HTMLElement && view.contains(document.activeElement) ? document.activeElement.dataset["do"] : undefined;
    view.innerHTML = render();
    if (focused) view.querySelector<HTMLElement>(`[data-do="${focused}"]`)?.focus();
  }

  /** Only the picture, the lamps and the numbers, when no box has opened or closed. */
  function refresh(): void {
    const fresh = document.createElement("div");
    fresh.innerHTML = render();
    for (const live of view.querySelectorAll<HTMLElement>("[data-show]")) {
      const next = fresh.querySelector<HTMLElement>(`[data-show="${live.dataset["show"]}"]`);
      if (!next) continue;
      // The same picture, given a new source: it goes on showing the last drawing until the next is ready.
      if (live instanceof HTMLImageElement) {
        if (live.getAttribute("src") !== next.getAttribute("src")) {
          live.src = next.getAttribute("src") ?? "";
          live.alt = next.getAttribute("alt") ?? "";
        }
      } else if (live.innerHTML !== next.innerHTML) live.innerHTML = next.innerHTML;
    }
  }

  function load(): FibergochiState | null {
    try {
      return readKept(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function keep(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(fibergochi.state));
    } catch {
      // A browser that keeps nothing still has a Fibergochi for this visit.
    }
  }

  const clock = setInterval(() => {
    if (!running || !seen.onScreen() || !fibergochi.alive || fibergochi.waiting) return;
    fibergochi.beat();
    steps += 1;
    if (fibergochi.waiting || !fibergochi.alive) {
      keep();
      draw();
      return;
    }
    if (steps % KEEP_EVERY === 0) keep();
    refresh();
  }, PACE);

  /** The keys on the egg change only what it is doing; the rest open or close a box. */
  const keys: Record<string, () => void> = {
    study: () => fibergochi.studyOrSleep(),
    http: () => fibergochi.browse(),
    terminal: () => fibergochi.lookForTerminal(),
    beg: () => fibergochi.beg(),
    // alfa, Bar and Amigos were never written, and do nothing, as they did not then.
  };
  const boxes: Record<string, () => void> = {
    pause: () => (running = !running),
    new: () => (confirmingNew = true),
    "new-no": () => (confirmingNew = false),
    "new-yes": () => {
      fibergochi = new Fibergochi(Math.random);
      confirmingNew = false;
      running = true;
    },
    ok: () => fibergochi.dismiss(),
    superior: () => fibergochi.choose("superior"),
    tecnica: () => fibergochi.choose("tecnica"),
  };

  function onClick(event: Event): void {
    const does = (event.target as HTMLElement).closest<HTMLElement>("button[data-do]")?.dataset["do"] ?? "";
    if (does.startsWith("lamp-")) {
      picked = does.slice("lamp-".length);
      refresh();
    } else if (keys[does]) {
      keys[does]();
      refresh();
    } else if (boxes[does]) {
      boxes[does]();
      keep();
      draw();
    }
  }

  function onSubmit(event: Event): void {
    event.preventDefault();
    const credits = (event.target as HTMLFormElement).querySelector<HTMLInputElement>("input[name=credits]");
    if (credits && fibergochi.enrol(Number(credits.value))) {
      keep();
      draw();
    }
  }

  host.addEventListener("click", onClick);
  host.addEventListener("submit", onSubmit);
  window.addEventListener("pagehide", keep);
  host.replaceChildren(view, drawings);
  draw();

  return () => {
    clearInterval(clock);
    seen.stop();
    keep();
    host.removeEventListener("click", onClick);
    host.removeEventListener("submit", onSubmit);
    window.removeEventListener("pagehide", keep);
  };
}
