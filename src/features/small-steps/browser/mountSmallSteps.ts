import { el } from "../../../platform/browser/el";
import { mountPlayer, type Playback } from "../../../platform/browser/mountPlayer";
import { randomSteps } from "../randomSteps";
import { renderSmallSteps } from "../renderSmallSteps";
import { SMALL_STEPS_LENGTH } from "../SMALL_STEPS_LENGTH";
import { smallStepsFrames } from "../smallStepsFrames";

/** Enough rounds to be seen, few enough not to nag: then it rests on a row all green. */
const ROUNDS = 3;

/**
 * The row plays: a new run of steps each round, the dice thrown here, and the
 * player keeps it from wearing on the reader. The row is its own element, so
 * a new start redraws it and leaves the player's button where it is; within a
 * run only the marks' classes change, frame to frame.
 */
export function mountSmallSteps(host: HTMLElement): () => void {
  const row = el("div", { class: "small-steps-row" });
  host.replaceChildren(row);
  const start = (): Playback => {
    row.innerHTML = renderSmallSteps(Array.from({ length: SMALL_STEPS_LENGTH }, () => "empty"));
    const marks = [...row.querySelectorAll("li")];
    const frames = Array.from({ length: ROUNDS }, (_, round) => smallStepsFrames(randomSteps(Math.random, SMALL_STEPS_LENGTH), { wipe: round < ROUNDS - 1 })).flat();
    let at = 0;
    return () => {
      const frame = frames[at++];
      if (!frame) return null;
      frame.marks.forEach((mark, index) => {
        const li = marks[index];
        if (li && li.className !== mark) li.className = mark;
      });
      return frame.hold;
    };
  };
  return mountPlayer(host, start);
}
