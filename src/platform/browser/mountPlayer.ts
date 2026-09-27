import { el } from "./el";

/** A run of frames: each call shows the next one and says how long it stays, in milliseconds — or null, once there is none. */
export type Playback = () => number | null;

/**
 * Whatever moves on a page, played so that it does not wear on the reader:
 * only while it is on screen, with a button to pause it and go on, resting
 * on its last frame when the run is over, with the same button to play it
 * again. A reader who asked for less motion keeps the still, untouched.
 */
export function mountPlayer(host: HTMLElement, start: () => Playback): () => void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};

  let playback = start();
  let playing = true;
  let done = false;
  let onScreen = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const button = el("button", { type: "button", class: "player" });
  const say = (label: string, glyph: string) => {
    button.setAttribute("aria-label", label);
    button.textContent = glyph;
  };
  say("Pause", "⏸");

  const tick = () => {
    timer = undefined;
    if (!playing || !onScreen || done) return;
    const hold = playback();
    if (hold === null) {
      done = true;
      say("Play again", "↻");
      return;
    }
    timer = setTimeout(tick, hold);
  };
  const halt = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  button.addEventListener("click", () => {
    if (done) {
      playback = start();
      done = false;
      playing = true;
      say("Pause", "⏸");
      halt();
      tick();
      return;
    }
    playing = !playing;
    say(playing ? "Pause" : "Play", playing ? "⏸" : "▶");
    if (playing) tick();
    else halt();
  });
  host.append(button);

  // Off screen it waits where it was, and takes up again when it is back in view.
  const observer =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) onScreen = entry.isIntersecting;
          if (!onScreen) halt();
          else if (timer === undefined) tick();
        })
      : undefined;
  observer?.observe(host);

  tick();
  return () => {
    halt();
    observer?.disconnect();
    button.remove();
  };
}
