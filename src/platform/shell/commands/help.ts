import { escapeHtml } from "../../markdown/escapeHtml";
import type { Command } from "../Command";

export const help: Command = {
  name: "help",
  usage: "help [command]",
  description: "this",
  run({ commands }, [name]) {
    if (name) {
      const command = commands.find((candidate) => candidate.name === name);
      if (!command) return { text: `help: ${name}: no such command`, error: true };
      return { text: `${command.usage}\n  ${command.description}` };
    }
    const width = Math.max(...commands.map((command) => command.usage.length));
    const lines = commands.map((command) => `${command.usage.padEnd(width)}  ${command.description}`);
    const keys =
      "Tab completes; → takes the grey suggestion. ↑↓ recall. ^K kills to the end of the line, ^U back to the start, ^Y puts it back.";
    // The text is columns, which only hold on a wide screen; the markup is a grid, which folds on a narrow one.
    const rows = commands.map((command) => `<dt><a href="#" data-run="help ${command.name}">${escapeHtml(command.usage)}</a></dt><dd>${escapeHtml(command.description)}</dd>`).join("");
    return {
      text: ["Commands:", ...lines, "", keys].join("\n"),
      html: `<p>Commands:</p><dl class="help">${rows}</dl><p>${escapeHtml(keys)}</p>`,
    };
  },
};
