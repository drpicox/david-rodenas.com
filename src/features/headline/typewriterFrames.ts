/**
 * Every state the headline passes through on its way from one text to
 * another, as a terminal would show them: the old text taken back a
 * character at a time down to nothing, then the new one put down a
 * character at a time. Newlines travel as characters like any other.
 */
export function typewriterFrames(from: string, to: string): string[] {
  const frames: string[] = [];
  for (let length = from.length - 1; length >= 0; length -= 1) frames.push(from.slice(0, length));
  for (let length = 1; length <= to.length; length += 1) frames.push(to.slice(0, length));
  return frames;
}
