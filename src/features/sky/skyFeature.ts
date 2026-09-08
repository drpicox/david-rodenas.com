import type { Feature } from "../../platform/plugin/Feature";
import { followTurning } from "./browser/followTurning";
import { Starfield } from "./browser/Starfield";

const starfield = new Starfield();

/**
 * The night sky of the page that insists on night: two tiled layers of stars
 * that drift on their own, and go with your hand when there is a world on the
 * page to take hold of.
 *
 * The layers themselves are in the stylesheet, because they have to be there
 * before any script is, and because moving them is a job for the compositor
 * and not for this. What is here is when they are driven and by how much.
 */
export const skyFeature: Feature = {
  name: "sky",
  install: () => followTurning(starfield),
  // A new page has its own sky, or none; either way the last page's hand is off it.
  arrive: () => starfield.release(),
};
