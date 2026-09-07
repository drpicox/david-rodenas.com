import { generateWorld } from "../core/planet/generateWorld";
import { renderSphere } from "../core/planet/renderSphere";

const TURN_SECONDS = 90;

/**
 * Grows a world and turns it.
 *
 * The world is built once — it is the expensive half — and every frame after
 * that is only a projection of it, which is cheap enough to leave running.
 * Someone who would rather things held still gets a single frame.
 */
export function spinPlanet(canvas: HTMLCanvasElement, seed = Math.floor(Math.random() * 0xffffff)): () => void {
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  const size = canvas.width;
  const world = generateWorld(seed);
  const image = context.createImageData(size, size);
  canvas.dataset["seed"] = String(seed);

  const paint = (rotation: number) => {
    image.data.set(renderSphere(world, size, { rotation }));
    context.putImageData(image, 0, 0);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    paint(0.6);
    return () => {};
  }

  let frame = 0;
  const started = performance.now();
  const tick = (now: number) => {
    paint(((now - started) / 1000 / TURN_SECONDS) * Math.PI * 2);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(frame);
}
