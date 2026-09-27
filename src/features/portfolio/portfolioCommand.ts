import type { Command } from "../../platform/shell/Command";
import type { Outcome } from "../../platform/shell/Outcome";
import type { Layout } from "./Layout";

const CHOICES = ["on", "off"] as const;

/** Both choices, always, with the one it landed on marked, as `theme` answers. */
function settled(on: boolean): Outcome {
  const landed = on ? "on" : "off";
  return {
    text: `portfolio   ${CHOICES.map((choice) => (choice === landed ? `[${choice}]` : choice)).join("   ")}`,
    html: `<pre class="choices">portfolio   ${CHOICES.map((choice) =>
      choice === landed ? `<strong aria-current="true">${choice}</strong>` : `<a href="#" data-run="portfolio ${choice}" title="portfolio ${choice}">${choice}</a>`,
    ).join("   ")}</pre>`,
  };
}

/** `portfolio`: the lists of the site as cards with their pictures, or plain. A trial, and so a switch. */
export function portfolioCommand(layout: Layout): Command {
  return {
    name: "portfolio",
    usage: "portfolio [on|off]",
    description: "show the lists as cards with their pictures, or plain",
    run(_context, [choice]) {
      if (choice === undefined) return settled(layout.apply("toggle"));
      if (choice !== "on" && choice !== "off") return { text: `portfolio: ${choice}: choose on or off`, error: true };
      return settled(layout.apply(choice));
    },
  };
}
