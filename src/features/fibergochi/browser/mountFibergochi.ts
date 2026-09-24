import { el } from "../../../platform/browser/el";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";
import { Fibergochi } from "../Fibergochi";
import type { FibergochiState } from "../FibergochiState";
import { readKept } from "../readKept";
import { renderFibergochi } from "../renderFibergochi";
import { Sprite } from "../Sprite";

/** A new key for the version of March: a Fibergochi of February kept in a browser does not have its habits. */
const KEY = "fibergochi:1999-03-02";
/**
 * The three speeds of March 1999, a step every so many milliseconds, and the
 * order the speed key went round them in. It started slow: a day in
 * forty-eight seconds, a term in twenty minutes.
 */
const PACES = { slow: 1000, normal: 400, fast: 10 } as const;
const NEXT_PACE = { slow: "normal", normal: "fast", fast: "slow" } as const;
/** The picture had a clock of its own, whatever the speed of the days. */
const BEAT = 100;
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
  let pace: keyof typeof PACES = "slow";
  let steps = 0;
  const seen = watchOnScreen(host);
  const view = document.createElement("div");
  // Every drawing, asked for at once and kept where nobody sees it, so a new frame is never waited for in view.
  const drawings = el(
    "div",
    { hidden: true },
    ...Sprite.everyImage.map((image) => el("img", { src: `/fibergochi/${image}.gif`, alt: "", width: 50, height: 40 })),
  );

  const render = () => renderFibergochi(fibergochi, { running, confirmingNew, pace, picked });

  function draw(): void {
    const focused = document.activeElement instanceof HTMLElement && view.contains(document.activeElement) ? document.activeElement.dataset["do"] : undefined;
    view.innerHTML = render();
    if (focused) view.querySelector<HTMLElement>(`[data-do="${focused}"]`)?.focus();
  }

  /** Only the picture, the lamps, the clock and what the lamps mean, when no box has opened or closed. */
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

  const living = () => running && seen.onScreen() && fibergochi.alive && !fibergochi.waiting;

  // The days, at the speed chosen: each step asks for the next, so a new speed is taken at once.
  let clock: ReturnType<typeof setTimeout> = setTimeout(tick, PACES[pace]);
  function tick(): void {
    clock = setTimeout(tick, PACES[pace]);
    if (!living()) return;
    fibergochi.step();
    steps += 1;
    if (fibergochi.waiting || !fibergochi.alive) {
      keep();
      draw();
      return;
    }
    if (steps % KEEP_EVERY === 0) keep();
    refresh();
  }

  const beat = setInterval(() => {
    if (!living()) return;
    fibergochi.animate();
    refresh();
  }, BEAT);

  /** The keys on the egg change what it is doing, or, alfa, open a box with the score. */
  const keys: Record<string, () => void> = {
    study: () => fibergochi.studyOrSleep(),
    http: () => fibergochi.browse(),
    alfa: () => fibergochi.alfa(),
    bar: () => fibergochi.goToBar(),
    friends: () => fibergochi.makeFriends(),
    terminal: () => fibergochi.lookForTerminal(),
    beg: () => fibergochi.beg(),
  };
  const boxes: Record<string, () => void> = {
    pause: () => (running = !running),
    speed: () => {
      pace = NEXT_PACE[pace];
      clearTimeout(clock);
      clock = setTimeout(tick, PACES[pace]);
    },
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
      if (fibergochi.waiting) draw();
      else refresh();
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
    clearTimeout(clock);
    clearInterval(beat);
    seen.stop();
    keep();
    host.removeEventListener("click", onClick);
    host.removeEventListener("submit", onSubmit);
    window.removeEventListener("pagehide", keep);
  };
}
