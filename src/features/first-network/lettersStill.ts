import type { Still } from "../../platform/plugin/Feature";
import { firstReader } from "./firstReader";
import { glyphs } from "./glyphs";
import { renderLetters } from "./renderLetters";

/** An A on the grid and what the taught network makes of it, as the browser will also start. */
export const lettersStill: Still = () => renderLetters(firstReader(), glyphs.A!);
