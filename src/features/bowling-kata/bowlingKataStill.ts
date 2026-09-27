import type { Still } from "../../platform/plugin/Feature";
import { KATA_STEPS } from "./KATA_STEPS";
import { renderKataStep } from "./renderKataStep";
import { renderKataStrip } from "./renderKataStrip";

/** Every commit's colour, and the first commit shown, in the HTML before any script. */
export const bowlingKataStill: Still = () => `<div class="kata">${renderKataStrip(KATA_STEPS, 0)}${renderKataStep(KATA_STEPS[0]!)}</div>`;
