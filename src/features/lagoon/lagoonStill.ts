import type { Still } from "../../platform/plugin/Feature";
import { renderLagoon } from "./renderLagoon";
import { theLagoon } from "./theLagoon";
import { Tournament } from "./Tournament";

/** The lagoon before the first round, as the browser will also find it: a hundred fish, ten weeks, and the five seated by default. */
export const lagoonStill: Still = () => renderLagoon(new Tournament(100, 10, theLagoon().filter(({ seated }) => seated).map(({ fisher }) => fisher)));
