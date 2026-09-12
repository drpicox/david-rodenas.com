import { growWorld } from "../growWorld";
import { SphereRaster } from "../SphereRaster";
import { textCells } from "../textCells";
import { textWorldHtml } from "../textWorldHtml";
import { HEADER_RECIPE, type WorldRecipe } from "../WorldRecipe";
import { paintFavicon } from "./favicon";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";

const TURN_SECONDS = 90;
/** A screen of the time redrew a picture a few times a second, and at sixteen pixels across nothing more is visible. */
const FRAME_MS = 1000 / 12;
/** The tab's icon turns too, but a few times a second is plenty for 32 pixels. */
const FAVICON_EVERY_MS = 400;

/** One animation per mark: starting another stops the one before it. */
const running = new WeakMap<HTMLElement, () => void>();

/** The block of cells the page left for the world: as many across as its widest line, as many down as it has lines. */
function cellsOf(mark: HTMLElement): { columns: number; rows: number } {
  const lines = (mark.textContent ?? "").split("\n");
  return { columns: Math.max(...lines.map((line) => line.length)), rows: lines.length };
}

/**
 * Grows a world and turns it, in text mode: the mark is a block of character
 * cells, and every frame is the world rasterised at that many pixels across,
 * folded two pixels to a cell and written out as half-blocks in the card's
 * sixteen colours.
 *
 * The world is built once — it is the expensive half — and every frame after
 * that is only a projection of it. Someone who would rather things held still
 * gets a single frame.
 */
export function spinPlanet(mark: HTMLElement, recipe?: WorldRecipe): () => void {
  running.get(mark)?.();

  const chosen = recipe ?? { ...HEADER_RECIPE, seed: Math.floor(Math.random() * 0xffffff) };
  const { columns, rows } = cellsOf(mark);
  const size = Math.min(columns, rows * 2);
  const world = growWorld(chosen);
  const raster = new SphereRaster(size);
  mark.dataset["seed"] = String(chosen.seed);
  mark.title = `World ${chosen.seed}, ${world.mesh.faceCount.toLocaleString("en")} triangles`;

  const paint = (rotation: number) => {
    mark.innerHTML = textWorldHtml(textCells(raster.paint(world, { rotation }), size));
    mark.classList.add("grown");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    paint(0.6);
    paintFavicon(world, 0.6);
    running.set(mark, () => {});
    return () => {};
  }

  let frame = 0;
  let painted = -Infinity;
  let iconPainted = -Infinity;
  const started = performance.now();
  // Scrolled past, the mark is not worth rasterising; the tab's icon still is.
  const view = watchOnScreen(mark);
  const tick = (now: number) => {
    const rotation = ((now - started) / 1000 / TURN_SECONDS) * Math.PI * 2;
    if (view.onScreen() && now - painted >= FRAME_MS) {
      paint(rotation);
      painted = now;
    }
    if (now - iconPainted > FAVICON_EVERY_MS) {
      paintFavicon(world, rotation);
      iconPainted = now;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  const stop = () => {
    cancelAnimationFrame(frame);
    view.stop();
  };
  running.set(mark, stop);
  return stop;
}
