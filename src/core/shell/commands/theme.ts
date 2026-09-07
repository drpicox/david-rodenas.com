import type { Command } from "../Command";

const CHOICES = ["light", "dark", "system"] as const;
type Choice = (typeof CHOICES)[number];

function isChoice(value: string): value is Choice {
  return (CHOICES as readonly string[]).includes(value);
}

export const theme: Command = {
  name: "theme",
  usage: "theme [light|dark|system]",
  description: "switch the colours, or toggle them",
  run(_context, [choice]) {
    if (choice === undefined) return { theme: "toggle", text: "theme: toggled" };
    if (!isChoice(choice)) return { text: `theme: ${choice}: choose light, dark or system`, error: true };
    return { theme: choice, text: `theme: ${choice}` };
  },
};
