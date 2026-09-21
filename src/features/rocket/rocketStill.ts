import type { Still } from "../../platform/plugin/Feature";
import { firstShip } from "./firstShip";
import { renderVoyages } from "./renderVoyages";

/** The first ship, every destination, and the trip to the nearest star drawn. */
export const rocketStill: Still = () => renderVoyages(firstShip, "Proxima Centauri");
