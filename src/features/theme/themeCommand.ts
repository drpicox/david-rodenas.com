import type { Command } from "../../platform/shell/Command";
import type { Outcome } from "../../platform/shell/Outcome";
import type { Theme } from "./Theme";
import type { ThemeChoice } from "./ThemeChoice";

const CHOICES = ["light", "dark", "system"] as const;

function isChoice(value: string): value is ThemeChoice {
  return (CHOICES as readonly string[]).includes(value);
}

/** A sign for each, as text and never as an emoji: the variation selector after it says so to the fonts that would choose otherwise. */
const SIGNS: Readonly<Record<(typeof CHOICES)[number], string>> = { light: "\u2600\uFE0E", dark: "\u263E\uFE0E", system: "\u25D0\uFE0E" };

/**
 * All three, always, with the one it landed on marked.
 *
 * A toggle is the right default — one word, one keystroke, and most of the
 * time it is what you meant — but it hides that there are three. An earlier
 * answer named where it had landed and offered the other two as commands to
 * type; it was accurate and read like a log. This one is the row of choices a
 * reader expects, each with its sign — sun, moon, and the half of each that
 * the button in the header wears — so that where you are is seen before it is
 * read. The plain text marks the current one with brackets; the markup makes
 * it strong and makes the others things to click, and clicking one runs the
 * very command its title names, so the echo above the next answer is what
 * would have been typed anyway.
 */
function settled(became: "light" | "dark" | "system"): Outcome {
  const label = (choice: (typeof CHOICES)[number]) => `${SIGNS[choice]} ${choice}`;
  return {
    text: `theme   ${CHOICES.map((choice) => (choice === became ? `[${label(choice)}]` : label(choice))).join("   ")}`,
    html: `<pre class="choices">theme   ${CHOICES.map((choice) =>
      choice === became
        ? `<strong aria-current="true">${label(choice)}</strong>`
        : `<a href="#" data-run="theme ${choice}" title="theme ${choice}">${label(choice)}</a>`,
    ).join("   ")}</pre>`,
  };
}

/**
 * The `theme` command, over whatever can actually change the colours.
 *
 * It is a function of a `Theme` and not a command that knows how to set one,
 * because the two are different jobs and only one of them needs a browser.
 * This half is about words — which of them are choices, what to say back, when
 * to refuse — and it is the half worth testing.
 */
export function themeCommand(theme: Theme): Command {
  return {
    name: "theme",
    usage: "theme [light|dark|system|auto]",
    description: "switch the colours, or toggle them",
    run({ site, cwd }, [choice]) {
      const own = site.at(cwd)?.fields["theme"];
      if (own) return { text: `theme: this page keeps its own, ${own}. It works everywhere else.`, error: true };
      if (choice === undefined) return settled(theme.apply("toggle"));
      const wanted = choice === "auto" ? "system" : choice;
      if (!isChoice(wanted)) return { text: `theme: ${choice}: choose light, dark or system`, error: true };
      return settled(theme.apply(wanted));
    },
  };
}
