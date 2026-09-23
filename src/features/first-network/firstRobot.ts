import { LightRobot } from "./LightRobot";

/** The run the page opens on, the same at build time and in the browser. */
export function firstRobot(): LightRobot {
  return new LightRobot(1);
}
