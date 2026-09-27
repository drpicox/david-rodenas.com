import type { Still } from "../../platform/plugin/Feature";
import { randomOf } from "../../platform/random/randomOf";
import { randomSteps } from "./randomSteps";
import { renderSmallSteps } from "./renderSmallSteps";
import { SMALL_STEPS_LENGTH } from "./SMALL_STEPS_LENGTH";

/** A full row, every test already put right, in the HTML before any script: the same dice every build. */
export const smallStepsStill: Still = () => renderSmallSteps(randomSteps(randomOf(2026), SMALL_STEPS_LENGTH).map((step) => (step === "test" ? "green" : "clean")));
