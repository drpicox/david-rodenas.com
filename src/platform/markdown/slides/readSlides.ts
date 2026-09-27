/** One frame of a block of slides: its text, and what was said of it, if anything — a test red or green, or a note. */
export interface Slide {
  readonly text: string;
  readonly status?: { readonly kind: "red" | "green" | "note"; readonly text: string };
}

const CLOSE = /^---(?:\s+(.*))?$/;

/**
 * A ```slides block, read: frames of text, each closed by a line of three
 * dashes that may say how it went — `--- red Expected: 2. Received: 1.`,
 * `--- green All tests pass.`, or anything else as a note. What follows the
 * last dashes is a frame of its own, with nothing said.
 */
export function readSlides(body: string): Slide[] {
  const slides: Slide[] = [];
  let lines: string[] = [];
  for (const line of body.split("\n")) {
    const close = CLOSE.exec(line);
    if (!close) {
      lines.push(line);
      continue;
    }
    const said = close[1]?.trim() ?? "";
    const kind = /^(red|green)\s/.exec(said)?.[1] as "red" | "green" | undefined;
    const text = lines.join("\n");
    if (!said) slides.push({ text });
    else slides.push({ text, status: kind ? { kind, text: said.slice(kind.length).trim() } : { kind: "note", text: said } });
    lines = [];
  }
  if (lines.some((line) => line.trim())) slides.push({ text: lines.join("\n") });
  return slides;
}
