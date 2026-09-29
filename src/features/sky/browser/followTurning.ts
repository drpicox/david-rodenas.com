import type { Turns } from "../Turns";
import type { Starfield } from "./Starfield";

/**
 * The connector: the stars follow whatever turns they are handed. Which
 * thing that is, the sky does not say: the composition does, where the
 * features are put together, so the sky needs nothing of any other feature
 * and nothing else needs the sky.
 */
export function followTurning(starfield: Pick<Starfield, "follow">, turns: Turns): () => void {
  return turns.on((turn) => starfield.follow(turn));
}
