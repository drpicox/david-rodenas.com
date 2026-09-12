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
    return { text: ["Commands:", ...lines, "", keys].join("\n") };
  },
};
