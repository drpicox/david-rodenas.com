import type { SmallStep } from "./randomSteps";

/**
 * A place in the row: nothing yet, a test failing, a test just put right and
 * showing it for a moment, a test passing, or a clean step.
 */
export type Mark = "empty" | "red" | "fixed" | "green" | "clean";

/** What the row shows, and for how long before the next frame, in milliseconds. */
export interface Frame {
  readonly marks: readonly Mark[];
  readonly hold: number;
}

const STEP = 220;
/** Long enough to see it being put right: the stylesheet fills it with green from below while it waits. */
const RED = 950;
const FULL = 2200;
const WIPE = 45;

/**
 * A run of steps as the frames that show it: each step takes its place in
 * turn; a test comes in red, and the row goes back to it and turns it green
 * before the next step is taken; a full row stays a moment, all green, and
 * is wiped from the left so the next run can start — unless there is no next
 * run, and the row rests as it is.
 */
export function smallStepsFrames(steps: readonly SmallStep[], { wipe = true }: { wipe?: boolean } = {}): Frame[] {
  const marks: Mark[] = steps.map(() => "empty");
  const frames: Frame[] = [{ marks: [...marks], hold: STEP }];
  const show = (hold: number) => frames.push({ marks: [...marks], hold });
  steps.forEach((step, index) => {
    if (step === "test") {
      marks[index] = "red";
      show(RED);
      marks[index] = "fixed";
    } else marks[index] = "clean";
    show(index === steps.length - 1 ? FULL : STEP);
  });
  if (!wipe) return frames;
  steps.forEach((_, index) => {
    marks[index] = "empty";
    show(WIPE);
  });
  return frames;
}
