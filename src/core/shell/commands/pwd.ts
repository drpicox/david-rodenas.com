import type { Command } from "../Command";
import { promptPath } from "../promptPath";

export const pwd: Command = {
  name: "pwd",
  usage: "pwd",
  description: "print where you are",
  run({ cwd }) {
    return { text: promptPath(cwd) };
  },
};
