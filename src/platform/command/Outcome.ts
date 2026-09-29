/**
 * What running a command asks of the page. The shell decides; the page does.
 *
 * Text and html are printed. `at` and `clear` are here because they are the
 * shell's own business — a shell over a site moves around it, and a shell has
 * a screen to wipe — and because only a browser can do either. `at` is the
 * address the session is now at, after a `cd` or a `cat`: the page's address
 * follows it, and the paper stays as it was — a session is not started over
 * because it moved.
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
  readonly at?: string;
  readonly clear?: boolean;
}
