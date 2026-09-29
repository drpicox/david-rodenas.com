import type { Command } from "../../command/Command";

export const clear: Command = {
  name: "clear",
  usage: "clear",
  description: "clear what the shell has printed",
  run() {
    return { clear: true };
  },
};
