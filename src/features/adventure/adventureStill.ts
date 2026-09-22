import type { Still } from "../../platform/plugin/Feature";
import { Adventure } from "./Adventure";
import { renderAdventure } from "./renderAdventure";

/** The first prompt of a new game, as the HTML has it before any script: the welcome room, and a map with one square lit. */
export const adventureStill: Still = () => renderAdventure(new Adventure());
