import type { Command } from "../Command";

export const clear: Command = {
  name: "clear",
  usage: "clear",
  description: "clear what the shell has printed",
  run() {
    return { clear: true };
  },
};
