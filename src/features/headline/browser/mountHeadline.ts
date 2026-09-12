import { typewriterFrames } from "../typewriterFrames";

/** The headline says what it says first; then it is taken back and another is typed; then that one has its turn. */
const OPENING_MS = 3800;
const HOLD_MS = 6500;
const ERASE_MS = 26;
const TYPE_MS = 46;
/** The pause a hand takes between finishing the erasing and starting to type. */
const BREATH_MS = 420;

/** The text of a heading with its line breaks as newlines, which is how the frames carry them. */
function textOf(heading: HTMLElement): string {
  return [...heading.childNodes].map((node) => (node.nodeName === "BR" ? "\n" : (node.textContent ?? ""))).join("");
}

/**
 * The headline on the home page, typed over. It is in the HTML whole from
 * the first byte — that is the one requirement — and this only adds a cursor
 * to it, waits, takes it back a character at a time and types the next one,
 * as a terminal would. The heading keeps its real words for anyone being
 * read to. Someone who would rather things held still gets the headline as
 * it was, without a cursor.
 */
export function mountHeadline(next: (current: string, original: string) => string): () => void {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const original = textOf(heading);
  heading.setAttribute("aria-label", original);
  heading.classList.add("typing");
  const cursor = document.createElement("span");
  cursor.className = "caret idle";
  cursor.setAttribute("aria-hidden", "true");

  const show = (text: string) => {
    const parts = text.split("\n").flatMap((line, at) => (at === 0 ? [line] : [document.createElement("br"), line]));
    heading.replaceChildren(...parts, cursor);
  };
  show(original);

  let current = original;
  let frames: string[] = [];
  let due = performance.now() + OPENING_MS;
  let handle = 0;

  const tick = (now: number) => {
    handle = requestAnimationFrame(tick);
    if (now < due) return;
    if (frames.length === 0) {
      const target = next(current, original);
      frames = typewriterFrames(current, target);
      current = target;
      cursor.classList.remove("idle");
    }
    const frame = frames.shift() ?? current;
    show(frame);
    if (frames.length === 0) {
      cursor.classList.add("idle");
      due = now + HOLD_MS;
    } else if (frame === "") {
      due = now + BREATH_MS;
    } else {
      due = now + (frame.length < (frames[0]?.length ?? 0) ? TYPE_MS : ERASE_MS);
    }
  };
  handle = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(handle);
    cursor.remove();
    heading.classList.remove("typing");
  };
}
