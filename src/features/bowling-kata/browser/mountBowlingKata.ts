import { el } from "../../../platform/browser/el";
import { KATA_STEPS } from "../KATA_STEPS";
import { renderKataStep } from "../renderKataStep";
import { renderKataStrip } from "../renderKataStrip";

const LAST = KATA_STEPS.length - 1;

/**
 * The kata one commit at a time: the strip of every commit above, red or
 * green, to jump anywhere; the commit shown below it, run as it is shown;
 * and the two ways of walking it — the buttons, or the arrow keys once the
 * kata has the focus.
 */
export function mountBowlingKata(host: HTMLElement): void {
  let at = 0;
  const strip = el("div");
  const step = el("div");
  const previous = el("button", { type: "button" }, "← previous");
  const next = el("button", { type: "button" }, "next →");

  const show = (commit: number) => {
    at = Math.max(0, Math.min(LAST, commit));
    strip.innerHTML = renderKataStrip(KATA_STEPS, at);
    step.innerHTML = renderKataStep(KATA_STEPS[at]!, KATA_STEPS[at - 1]);
    previous.disabled = at === 0;
    next.disabled = at === LAST;
  };

  previous.addEventListener("click", () => show(at - 1));
  next.addEventListener("click", () => show(at + 1));
  strip.addEventListener("click", (event) => {
    const cell = (event.target as Element | null)?.closest<HTMLElement>("[data-commit]");
    if (cell) show(Number(cell.dataset["commit"]));
  });
  host.tabIndex = 0;
  host.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") show(at + 1);
    else if (event.key === "ArrowLeft") show(at - 1);
    else return;
    event.preventDefault();
  });

  host.replaceChildren(el("div", { class: "kata" }, strip, el("div", { class: "kata-nav" }, previous, next), step));
  show(0);
}
