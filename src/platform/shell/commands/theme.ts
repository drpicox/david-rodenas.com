import type { Command } from "../Command";

const CHOICES = ["light", "dark", "system"] as const;
type Choice = (typeof CHOICES)[number];

function isChoice(value: string): value is Choice {
  return (CHOICES as readonly string[]).includes(value);
}

export const theme: Command = {
  name: "theme",
  usage: "theme [light|dark|system|auto]",
  description: "switch the colours, or toggle them",
  run({ site, cwd }, [choice]) {
    const own = site.at(cwd)?.fields["theme"];
    if (own) return { text: `theme: this page keeps its own, ${own}. It works everywhere else.`, error: true };
    if (choice === undefined) return { theme: "toggle", text: "theme: toggled" };
    const wanted = choice === "auto" ? "system" : choice;
    if (!isChoice(wanted)) return { text: `theme: ${choice}: choose light, dark or system`, error: true };
    return { theme: wanted, text: `theme: ${wanted}` };
  },
};
