import { turning } from "../../world/turning";
import { Starfield } from "./Starfield";

/**
 * The connector: the stars follow whatever turns.
 *
 * This is the whole of the coupling between the two features, it is one line
 * long, and it points one way. The world announces to nobody in particular;
 * this is what makes the sky somebody.
 */
export function followTurning(starfield: Starfield): () => void {
  return turning.on((moved) => starfield.follow(moved));
}
