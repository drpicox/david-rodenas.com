import type { Still } from "../../platform/plugin/Feature";
import { Fibergochi } from "./Fibergochi";
import { renderFibergochi } from "./renderFibergochi";

/** A Fibergochi just arrived, as the browser starts one for a first visit. */
export const fibergochiStill: Still = () => renderFibergochi(new Fibergochi(Math.random), { running: true, confirmingNew: false, pace: "slow" });
