import { growWorld } from "../growWorld";
import { SphereRaster } from "../SphereRaster";
import type { World } from "../World";
import { HEADER_RECIPE, type WorldRecipe } from "../WorldRecipe";
import { el } from "../../../platform/browser/el";
import { forgetHeaderWorld, rememberHeaderWorld, savedHeaderWorld } from "./headerWorld";
import { turning } from "../turning";
import { spinPlanet } from "./spinPlanet";
import { watchOnScreen } from "../../../platform/browser/watchOnScreen";

const SIZE = 360;
const TURN_SECONDS = 60;
/** A flung world keeps turning and loses speed with a time constant of this many seconds. */
const MOMENTUM_SECONDS = 1.4;
const IDLE_SPEED = (Math.PI * 2) / TURN_SECONDS;
/** No hand is that fast; anything above is a glitch, and a world spinning like a top is no fun to look at. */
const TOP_SPEED = Math.PI * 4;

/** The 1999 pipeline with its dials on the outside, and a world you can take hold of. */
export function mountWorlds(host: HTMLElement): () => void {
  const canvas = el("canvas", { class: "world", width: SIZE, height: SIZE });
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  const dials: { -readonly [K in keyof WorldRecipe]: WorldRecipe[K] } = {
    ...HEADER_RECIPE,
    seed: Math.floor(Math.random() * 0xffffff),
  };
  const image = context.createImageData(SIZE, SIZE);
  // The rasteriser paints into the canvas's own pixels, so a frame costs no memory at all.
  const raster = new SphereRaster(SIZE, image.data);
  const stillPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let world: World;
  let rotation = 0.6;
  let tilt = -0.38;
  let spinning = !stillPreferred;
  let dragging: { x: number; y: number; at: number } | null = null;
  /** Radians per second the hand was turning the world at, kept after it lets go. Positive is rightwards. */
  let momentum = 0;
  let lastFrame = performance.now();

  const caption = el("p", { class: "hint" });

  const headerCanvas = document.querySelector<HTMLCanvasElement>("canvas.planet");
  const headerTriangles = (20 * 4 ** HEADER_RECIPE.levels).toLocaleString("en");

  const grow = () => {
    world = growWorld(dials);
    const kept = savedHeaderWorld();
    caption.textContent =
      `World ${dials.seed}: ${world.mesh.faceCount.toLocaleString("en")} triangles. ` +
      (kept
        ? `The header is keeping world ${kept.seed}, ${(20 * 4 ** kept.levels).toLocaleString("en")} triangles.`
        : `The header grows a new one every visit, ${headerTriangles} triangles each.`);
    letGo.hidden = !kept;
    paint();
  };

  // The header takes this world, and keeps it in this browser until it is let go.
  const toHeader = el("button", {
    type: "button",
    onclick: () => {
      rememberHeaderWorld({ ...dials });
      if (headerCanvas) spinPlanet(headerCanvas, { ...dials });
      grow();
    },
  }, "Put it in the header");
  const letGo = el("button", {
    type: "button",
    hidden: true,
    onclick: () => {
      forgetHeaderWorld();
      if (headerCanvas) spinPlanet(headerCanvas);
      grow();
    },
  }, "Let the header grow its own");

  const paint = () => {
    raster.paint(world, { rotation, tilt });
    context.putImageData(image, 0, 0);
  };

  // Left alone the world turns at its idle pace. Flung, it turns at the hand's
  // pace and slows until it is back at the idle one, and the sky goes with it.
  let frame = 0;
  const view = watchOnScreen(canvas);
  const tick = (now: number) => {
    const seconds = Math.min(0.1, (now - lastFrame) / 1000);
    // Scrolled past the dials, the world keeps its momentum but costs nothing to keep.
    if (!dragging && view.onScreen()) {
      if (momentum !== 0) {
        momentum *= Math.exp(-seconds / MOMENTUM_SECONDS);
        const floor = spinning ? IDLE_SPEED : 0;
        if (Math.abs(momentum) <= floor || Math.abs(momentum) < 0.01) momentum = 0;
      }
      // The renderer turns the surface leftwards as rotation grows, so a rightward hand takes it away.
      if (momentum !== 0) {
        rotation -= momentum * seconds;
        paint();
      } else if (spinning) {
        rotation += IDLE_SPEED * seconds;
        paint();
      }
      // Whoever wants to move with the world is listening; the world does not know who.
      turning.send({ byRadians: momentum * seconds, tiltedBy: 0, seconds });
    }
    lastFrame = now;
    frame = requestAnimationFrame(tick);
  };

  canvas.addEventListener("pointerdown", (event) => {
    dragging = { x: event.clientX, y: event.clientY, at: event.timeStamp };
    momentum = 0;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const scale = canvas.clientWidth || SIZE;
    const turned = ((event.clientX - dragging.x) / scale) * Math.PI;
    rotation -= turned;
    const before = tilt;
    tilt = Math.max(-1.2, Math.min(1.2, tilt - ((event.clientY - dragging.y) / scale) * Math.PI));
    turning.send({ byRadians: turned, tiltedBy: tilt - before, seconds: 0 });
    // The hand's pace, smoothed a little so one jittery event does not decide the fling.
    const elapsed = Math.max(0.004, (event.timeStamp - dragging.at) / 1000);
    momentum = Math.max(-TOP_SPEED, Math.min(TOP_SPEED, momentum * 0.4 + (turned / elapsed) * 0.6));
    dragging = { x: event.clientX, y: event.clientY, at: event.timeStamp };
    paint();
  });
  canvas.addEventListener("pointerup", (event) => {
    // A hand that stopped before letting go leaves no momentum behind.
    if (dragging && event.timeStamp - dragging.at > 120) momentum = 0;
    dragging = null;
    lastFrame = performance.now();
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = null;
    momentum = 0;
  });

  const seedInput = el("input", {
    type: "number",
    min: 0,
    value: dials.seed,
    onchange: () => {
      dials.seed = Math.max(0, Math.floor(Number(seedInput.value) || 0));
      grow();
    },
  });
  const another = el("button", {
    type: "button",
    onclick: () => {
      dials.seed = Math.floor(Math.random() * 0xffffff);
      seedInput.value = String(dials.seed);
      grow();
    },
  }, "Another world");
  const spin = el("button", {
    type: "button",
    onclick: () => {
      spinning = !spinning;
      spin.textContent = spinning ? "Hold still" : "Turn";
    },
  }, spinning ? "Hold still" : "Turn");

  const dial = (key: "levels" | "roughness" | "share", label: string, min: number, max: number, step: number, show: (v: number) => string) => {
    const output = el("output", {}, show(dials[key]));
    const input = el("input", {
      type: "range",
      min,
      max,
      step,
      value: dials[key],
      onchange: () => {
        dials[key] = Number(input.value);
        output.textContent = show(dials[key]);
        grow();
      },
      oninput: () => {
        output.textContent = show(Number(input.value));
      },
    });
    return el("label", {}, `${label}: `, output, input);
  };

  host.append(
    canvas,
    el("div", { class: "row" }, el("span", {}, "Seed "), seedInput, another, spin, toHeader, letGo),
    el(
      "div",
      { class: "dials" },
      dial("levels", "Detail", 2, 6, 1, (v) => `${v} splits`),
      dial("roughness", "Roughness", 0.02, 1, 0.01, (v) => v.toFixed(2)),
      dial("share", "Sea", 0, 0.98, 0.01, (v) => `${Math.round(v * 100)}%`),
    ),
    caption,
  );

  grow();
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    view.stop();
  };
}
