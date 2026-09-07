import type { Command } from "../Command";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { help } from "./help";
import { ls } from "./ls";
import { pwd } from "./pwd";
import { theme } from "./theme";

/** In the order `help` prints them. */
export const allCommands: readonly Command[] = [ls, cd, cat, pwd, help, clear, theme];
