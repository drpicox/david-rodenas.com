import type { Command } from "../Command";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { help } from "./help";
import { ls } from "./ls";
import { pwd } from "./pwd";

/**
 * The commands that are about the site itself: where you are in it, what is
 * there, what it says. They are the platform's own, they need nothing from
 * any feature, and they come first in the order `help` prints.
 *
 * A feature that wants a command brings its own; the shell is handed the
 * whole list, and does not care which half of it came from where.
 */
export const siteCommands: readonly Command[] = [ls, cd, cat, pwd, help, clear];
