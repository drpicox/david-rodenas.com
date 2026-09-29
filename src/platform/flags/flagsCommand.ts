import { escapeHtml } from "../markdown/escapeHtml";
import type { Command } from "../command/Command";
import type { Outcome } from "../command/Outcome";
import type { Flag } from "./Flag";
import type { FlagStore } from "./FlagStore";

const CHOICES = ["on", "off"] as const;

/**
 * Every flag on a line, as `theme` answers: both choices with the current one
 * marked — bracketed in the text, strong in the markup, where the other is a
 * link that runs the command its title names.
 */
function listed(flags: readonly Flag[], store: FlagStore): Outcome {
  if (flags.length === 0) return { text: "No flags to try just now." };
  const width = Math.max(...flags.map((flag) => flag.name.length));
  const at = (flag: Flag) => (store.isOn(flag.name) ? "on" : "off");
  const text = flags.map((flag) => {
    const choices = CHOICES.map((choice) => (choice === at(flag) ? `[${choice}]` : ` ${choice} `)).join("");
    return `${flag.name.padEnd(width)}  ${choices}  ${flag.description}`;
  });
  // The markup is `help`'s list, which folds on a narrow screen; the words wrap there, where a line of text could only run off the edge.
  const rows = flags.map((flag) => {
    const choices = CHOICES.map((choice) =>
      choice === at(flag) ? `<strong aria-current="true">${choice}</strong>` : `<a href="#" data-run="flags ${flag.name} ${choice}" title="flags ${flag.name} ${choice}">${choice}</a>`,
    ).join(" ");
    return `<dt>${escapeHtml(flag.name)} <span class="switch">${choices}</span></dt><dd>${escapeHtml(flag.description)}</dd>`;
  });
  return { text: text.map((line) => line.trimEnd()).join("\n"), html: `<dl class="help flags">${rows.join("")}</dl>` };
}

/** `flags`: the trials the site can be switched into, and the switch for each. */
export function flagsCommand(flags: readonly Flag[], store: FlagStore): Command {
  return {
    name: "flags",
    usage: "flags [name [on|off]]",
    description: "list the trials this site can be switched into, or switch one",
    run(_context, [name, choice]) {
      if (name === undefined) return listed(flags, store);
      if (!flags.some((flag) => flag.name === name)) return { text: `flags: ${name}: no such flag. Try flags`, error: true };
      if (choice !== undefined && choice !== "on" && choice !== "off") return { text: `flags: ${name}: choose on or off`, error: true };
      store.set(name, choice === undefined ? !store.isOn(name) : choice === "on");
      return listed(flags, store);
    },
  };
}
