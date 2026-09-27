import { highlight } from "../markdown/highlight";
import type { Slide } from "../markdown/slides/readSlides";
import { slidesPlayback, type Shot } from "../markdown/slides/slidesPlayback";
import { el } from "./el";
import { mountPlayer, type Playback } from "./mountPlayer";

/** The frames back out of the page that carries them: the code as text, and what was said of each. */
function slidesIn(figure: Element): Slide[] {
  return [...figure.querySelectorAll(".slide:not(.live)")].map((slide) => {
    const text = slide.querySelector("code")?.textContent ?? "";
    const said = slide.querySelector(".slide-status");
    const kind = (["red", "green", "note"] as const).find((one) => said?.classList.contains(one));
    return said && kind ? { text, status: { kind, text: said.textContent ?? "" } } : { text };
  });
}

/** One block of slides, played on a screen of its own laid over the frames, which keep its size. */
function mountOne(figure: HTMLElement): () => void {
  const language = figure.dataset["language"] ?? "";
  const slides = slidesIn(figure);
  const code = el("code");
  const said = el("p", { class: "slide-status", hidden: true });
  const screen = el("div", { class: "slide live" }, el("pre", {}, code), said);

  const show = (shot: Shot) => {
    code.innerHTML =
      shot.caret === undefined ? highlight(shot.text, language) : `${highlight(shot.text.slice(0, shot.caret), language)}<span class="caret"></span>${highlight(shot.text.slice(shot.caret), language)}`;
    said.hidden = !shot.status;
    if (shot.status) {
      said.className = `slide-status ${shot.status.kind}`;
      said.textContent = shot.status.text;
    }
  };

  const start = (): Playback => {
    if (!screen.isConnected) figure.querySelector(".slides-screen")?.append(screen);
    figure.classList.add("playing");
    const shots = slidesPlayback(slides);
    let at = 0;
    return () => {
      const shot = shots[at++];
      if (!shot) return null;
      show(shot);
      return shot.hold;
    };
  };
  const stop = mountPlayer(figure, start);
  // Stopped, the page is left as it came, so that it can be played again from scratch.
  return () => {
    stop();
    screen.remove();
    figure.classList.remove("playing");
  };
}

/**
 * Every ```slides block on the page, played from its first frame: typed,
 * run, and said, one after the other. The page already holds every frame;
 * this only plays them. Returns how to stop them all.
 */
export function mountSlides(root: ParentNode): () => void {
  const stops = [...root.querySelectorAll<HTMLElement>("figure.slides")].map(mountOne);
  return () => {
    for (const stop of stops) stop();
  };
}
