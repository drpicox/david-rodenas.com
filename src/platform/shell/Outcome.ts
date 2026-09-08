/**
 * What running a command asks of the page. The shell decides; the page does.
 * Text and html are printed; the rest are things only a browser can do, and
 * the shell stays out of the browser so it can be tested without one.
 */
export interface Outcome {
  readonly text?: string;
  readonly html?: string;
  readonly error?: boolean;
  readonly navigate?: string;
  readonly clear?: boolean;
  readonly theme?: "light" | "dark" | "system" | "toggle";
}
