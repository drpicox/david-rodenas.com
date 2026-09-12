import type { Headline } from "../Headline";
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
export function mountHeadline(next: (current: Headline, original: Headline) => Headline): () => void {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const original: Headline = { text: textOf(heading) };
  heading.setAttribute("aria-label", original.text);
  heading.classList.add("typing");
  const cursor = document.createElement("span");
  cursor.className = "caret idle";
  cursor.setAttribute("aria-hidden", "true");

  // The words, their line breaks, and — where the headline leads somewhere — a link around them; the cursor after.
  const show = (text: string, href?: string) => {
    const parts = text.split("\n").flatMap((line, at) => (at === 0 ? [line] : [document.createElement("br"), line]));
    if (href) {
      const link = document.createElement("a");
      link.href = href;
      link.append(...parts);
      heading.replaceChildren(link, cursor);
    } else {
      heading.replaceChildren(...parts, cursor);
    }
  };
  show(original.text);

  let current = original;
  let frames: string[] = [];
  let due = performance.now() + OPENING_MS;
  let handle = 0;

  const tick = (now: number) => {
    handle = requestAnimationFrame(tick);
    if (now < due) return;
    if (frames.length === 0) {
      const target = next(current, original);
      frames = typewriterFrames(current.text, target.text);
      current = target;
      cursor.classList.remove("idle");
    }
    const frame = frames.shift() ?? current.text;
    // While the old words are still being taken back the link is not yet the new one; from the first new letter it is.
    show(frame, frames.length < (current.text.length || 1) ? current.href : undefined);
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

  // Stopped, the heading says what it said before anything was typed over it, with no cursor — whatever it was mid-way through.
  return () => {
    cancelAnimationFrame(handle);
    show(original.text);
    cursor.remove();
    heading.classList.remove("typing");
    heading.removeAttribute("aria-label");
  };
}
