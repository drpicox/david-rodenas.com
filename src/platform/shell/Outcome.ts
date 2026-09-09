/**
 * What running a command asks of the page. The shell decides; the page does.
 *
 * Text and html are printed. `navigate` and `clear` are here because they are
 * the shell's own business — a shell over a site moves around it, and a shell
 * has a screen to wipe — and because only a browser can do either.
 *
 * Nothing a feature invents belongs in this list. The colours used to, and it
 * meant the frame could not be read without knowing what a theme was, and
 * deleting the feature would have left a hole here. A feature's command talks
 * to its own feature and returns words, like every other command.
 */
export interface Outcome {
  readonly text?: string;
  readonly html?: string;
  readonly error?: boolean;
  readonly navigate?: string;
  readonly clear?: boolean;
  /** A page to show whole, in the viewer, without the shell moving: what `cat` is. `html` stays for a screen with no viewer. */
  readonly view?: string;
}
