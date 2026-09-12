import { savedHeaderWorld } from "./headerWorld";
import { spinPlanet } from "./spinPlanet";

/** The mark in the header is a world, grown when the page opens and turning ever since. */
export function mountHeaderWorld(): () => void {
  const mark = document.querySelector<HTMLElement>(".planet");
  if (!mark) return () => {};
  return spinPlanet(mark, savedHeaderWorld() ?? undefined);
}
