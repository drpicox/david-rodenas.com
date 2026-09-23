import type { Still } from "../../platform/plugin/Feature";
import { firstRobot } from "./firstRobot";
import { renderRobot } from "./renderRobot";

/** Turn 0: nothing learnt, the R and the star where the browser will find them. */
export const robotStill: Still = () => {
  const robot = firstRobot();
  return renderRobot(robot, 0, [[robot.x, robot.y]]);
};
