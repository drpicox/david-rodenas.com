import { savedHeaderWorld } from "./headerWorld";
import { spinPlanet } from "./spinPlanet";

/** The mark in the header is a world, grown when the page opens and turning ever since. */
export function mountHeaderWorld(): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.planet");
  if (!canvas) return () => {};
  return spinPlanet(canvas, savedHeaderWorld() ?? undefined);
}
