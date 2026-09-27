import type { Slide } from "./readSlides";
import { typingSteps } from "./typingSteps";

/** What the screen shows, where the caret stands while typing, and how long it stays, in milliseconds. */
export interface Shot {
  readonly text: string;
  readonly caret?: number;
  readonly status?: Slide["status"];
  readonly hold: number;
}

const TYPE = 32;
const RUB = 14;
const RUN = 450;
const SAID = 1900;
const PAUSE = 1300;

/**
 * Slides as they are played: the first frame typed from nothing; a moment
 * while the tests run; what they said, held long enough to be read; then the
 * next frame, reached by rubbing out and typing only what changed.
 */
export function slidesPlayback(slides: readonly Slide[]): Shot[] {
  const shots: Shot[] = [];
  let text = "";
  for (const slide of slides) {
    for (const keystroke of typingSteps(text, slide.text)) {
      shots.push({ ...keystroke, hold: keystroke.text.length < text.length ? RUB : TYPE });
      text = keystroke.text;
    }
    text = slide.text;
    if (slide.status) shots.push({ text, hold: RUN }, { text, status: slide.status, hold: SAID });
    else shots.push({ text, hold: PAUSE });
  }
  return shots;
}
