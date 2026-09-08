import type { Command } from "../../platform/shell/Command";
import type { Theme } from "./Theme";
import type { ThemeChoice } from "./ThemeChoice";

const CHOICES = ["light", "dark", "system"] as const;

function isChoice(value: string): value is ThemeChoice {
  return (CHOICES as readonly string[]).includes(value);
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
      if (choice === undefined) return { text: `theme: ${theme.apply("toggle")}` };
      const wanted = choice === "auto" ? "system" : choice;
      if (!isChoice(wanted)) return { text: `theme: ${choice}: choose light, dark or system`, error: true };
      return { text: `theme: ${theme.apply(wanted)}` };
    },
  };
}
