/** A line, where the caret is in it, and what is on the kill buffer, after an edit. */
export interface Edited {
  readonly line: string;
  readonly caret: number;
  readonly killed: string;
}

/**
 * What a terminal's control keys do to a line: `^K` kills to the end of it,
 * `^U` kills back to the start, `^Y` puts the last kill back at the caret.
 *
 * They are readline's, which is to say they are what a person's hands already
 * know, and a prompt that calls itself a terminal should not be the one place
 * they do not work. Chrome does nothing with any of the three in a text field,
 * so there is nothing to take away from it.
 *
 * A line and a caret in, a line and a caret out, and the kill buffer passed
 * through rather than kept here — so the whole thing is a question with an
 * answer, and can be asked without a browser. `null` means the key was not
 * one of these, and whoever asked should carry on as before.
 */
export function editLine(key: string, line: string, caret: number, killed: string): Edited | null {
  if (key === "k") {
    const cut = line.slice(caret);
    // Nothing to kill is not killing nothing: an empty cut must not empty the buffer.
    return { line: line.slice(0, caret), caret, killed: cut || killed };
  }
  if (key === "u") {
    const cut = line.slice(0, caret);
    return { line: line.slice(caret), caret: 0, killed: cut || killed };
  }
  if (key === "y") {
    return { line: line.slice(0, caret) + killed + line.slice(caret), caret: caret + killed.length, killed };
  }
  return null;
}
