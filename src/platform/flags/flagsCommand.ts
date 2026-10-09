import { escapeHtml } from "../markdown/escapeHtml";
import type { Command } from "../command/Command";
import type { Outcome } from "../command/Outcome";
import type { Flag } from "./Flag";
import type { FlagStore } from "./FlagStore";

const OFF = "off";

/** What a flag can be set to: on or off, or one of its choices or off. */
const optionsOf = (flag: Flag) => [...(flag.choices ?? ["on"]), OFF];

/** What a flag is set to now. A choice is kept as its own name in the store, `name=choice`. */
function settingOf(flag: Flag, store: FlagStore): string {
  if (!flag.choices) return store.isOn(flag.name) ? "on" : OFF;
  return flag.choices.find((choice) => store.isOn(`${flag.name}=${choice}`)) ?? OFF;
}

/** Sets a flag to one of its options: a choice turns every other choice off. */
function setTo(flag: Flag, store: FlagStore, option: string): void {
  if (!flag.choices) return store.set(flag.name, option === "on");
  for (const choice of flag.choices) store.set(`${flag.name}=${choice}`, choice === option);
}

const inWords = (options: readonly string[]) => `${options.slice(0, -1).join(", ")} or ${options.at(-1)}`;

/**
 * Every flag on a line, as `theme` answers: its choices with the current one
 * marked — bracketed in the text, strong in the markup, where each other is a
 * link that runs the command its title names.
 */
function listed(flags: readonly Flag[], store: FlagStore): Outcome {
  if (flags.length === 0) return { text: "No flags to try just now." };
  const width = Math.max(...flags.map((flag) => flag.name.length));
  const switches = flags.map((flag) => optionsOf(flag).map((option) => (option === settingOf(flag, store) ? `[${option}]` : ` ${option} `)).join(""));
  const across = Math.max(...switches.map((each) => each.length));
  const text = flags.map((flag, index) => `${flag.name.padEnd(width)}  ${switches[index]!.padEnd(across)}  ${flag.description}`);
  // The markup is `help`'s list, which folds on a narrow screen; the words wrap there, where a line of text could only run off the edge.
  const rows = flags.map((flag) => {
    const choices = optionsOf(flag)
      .map((option) =>
        option === settingOf(flag, store)
          ? `<strong aria-current="true">${escapeHtml(option)}</strong>`
          : `<a href="#" data-run="flags ${flag.name} ${option}" title="flags ${flag.name} ${option}">${escapeHtml(option)}</a>`,
      )
      .join(" ");
    return `<dt>${escapeHtml(flag.name)} <span class="switch">${choices}</span></dt><dd>${escapeHtml(flag.description)}</dd>`;
  });
  return { text: text.map((line) => line.trimEnd()).join("\n"), html: `<dl class="help flags">${rows.join("")}</dl>` };
}

/** `flags`: the trials the site can be switched into, and the switch for each. */
export function flagsCommand(flags: readonly Flag[], store: FlagStore): Command {
  return {
    name: "flags",
    usage: "flags [name [on|off|a choice]]",
    description: "list the trials this site can be switched into, or switch one",
    run(_context, [name, choice]) {
      if (name === undefined) return listed(flags, store);
      const flag = flags.find((each) => each.name === name);
      if (!flag) return { text: `flags: ${name}: no such flag. Try flags`, error: true };
      if (choice !== undefined && !optionsOf(flag).includes(choice)) return { text: `flags: ${name}: choose ${inWords(optionsOf(flag))}`, error: true };
      // Named alone, a flag is switched: off to on, or to its first choice, and anything else off.
      setTo(flag, store, choice ?? (settingOf(flag, store) === OFF ? optionsOf(flag)[0]! : OFF));
      return listed(flags, store);
    },
  };
}
