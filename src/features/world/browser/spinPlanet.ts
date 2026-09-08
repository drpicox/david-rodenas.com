import { growWorld } from "../growWorld";
import { SphereRaster } from "../SphereRaster";
import { HEADER_RECIPE, type WorldRecipe } from "../WorldRecipe";
import { paintFavicon } from "./favicon";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";

const TURN_SECONDS = 90;
/** The tab's icon turns too, but a few times a second is plenty for 32 pixels. */
const FAVICON_EVERY_MS = 400;

/** One animation per canvas: starting another stops the one before it. */
const running = new WeakMap<HTMLCanvasElement, () => void>();

/**
 * Grows a world and turns it.
 *
 * The world is built once — it is the expensive half — and every frame after
 * that is only a projection of it, which is cheap enough to leave running.
 * Someone who would rather things held still gets a single frame.
 */
export function spinPlanet(canvas: HTMLCanvasElement, recipe?: WorldRecipe): () => void {
  running.get(canvas)?.();
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  const chosen = recipe ?? { ...HEADER_RECIPE, seed: Math.floor(Math.random() * 0xffffff) };
  const size = canvas.width;
  const world = growWorld(chosen);
  const image = context.createImageData(size, size);
  // The rasteriser paints into the canvas's own pixels, so a frame costs no memory at all.
  const raster = new SphereRaster(size, image.data);
  canvas.dataset["seed"] = String(chosen.seed);
  canvas.title = `World ${chosen.seed}, ${world.mesh.faceCount.toLocaleString("en")} triangles`;

  const paint = (rotation: number) => {
    raster.paint(world, { rotation });
    context.putImageData(image, 0, 0);
    canvas.classList.add("grown");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    paint(0.6);
    paintFavicon(world, 0.6);
    running.set(canvas, () => {});
    return () => {};
  }

  let frame = 0;
  let iconPainted = -Infinity;
  const started = performance.now();
  // Scrolled past, the mark is not worth rasterising; the tab's icon still is.
  const view = watchOnScreen(canvas);
  const tick = (now: number) => {
    const rotation = ((now - started) / 1000 / TURN_SECONDS) * Math.PI * 2;
    if (view.onScreen()) paint(rotation);
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
  running.set(canvas, stop);
  return stop;
}
