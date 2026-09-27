import type { Values } from "../../platform/program/Values";
import { firstShip } from "./firstShip";
import type { Ship } from "./Ship";

/** The ship a program's values describe: the first ship's hull, with the fuel, the exhaust and the push it was told. */
export function shipOf(values: Values): Ship {
  return {
    dryMass: firstShip.dryMass,
    fuel: Number(values["fuel"]) * firstShip.dryMass,
    exhaust: Number(values["exhaust"]) / 100,
    acceleration: Number(values["acceleration"]),
  };
}
