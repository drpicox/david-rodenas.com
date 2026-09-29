import type { Feature } from "../../platform/plugin/Feature";
import { followTurning } from "./browser/followTurning";
import { Starfield } from "./browser/Starfield";
import type { Turns } from "./Turns";

/**
 * The night sky of the page that insists on night: two tiled layers of stars
 * that drift on their own, and go with your hand when something on the page
 * turns — whatever the composition hands it, for the sky does not know what
 * turns.
 *
 * The layers themselves are in the stylesheet, because they have to be there
 * before any script is, and because moving them is a job for the compositor
 * and not for this. What is here is when they are driven and by how much.
 */
export function skyFeature(...turns: readonly Turns[]): Feature {
  const starfield = new Starfield();
  return {
    name: "sky",
    install: () => {
      const stops = turns.map((each) => followTurning(starfield, each));
      return () => {
        for (const stop of stops) stop();
      };
    },
    // A new page has its own sky, or none; either way the last page's hand is off it.
    arrive: () => starfield.release(),
  };
}
