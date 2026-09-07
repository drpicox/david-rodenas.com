import { growWorld } from "../../core/planet/growWorld";
import { renderSphere } from "../../core/planet/renderSphere";
import type { World } from "../../core/planet/World";
import { HEADER_RECIPE, type WorldRecipe } from "../../core/planet/WorldRecipe";
import { el } from "../dom";
import { forgetHeaderWorld, rememberHeaderWorld, savedHeaderWorld } from "../headerWorld";
import { spinPlanet } from "../spinPlanet";

const SIZE = 360;
const TURN_SECONDS = 60;
/** The sky drifts on its own, much slower than the world; a hand on the world moves them together. */
const SKY_SECONDS = 480;
/** How far the stars slide for one full turn of the world, or one full turn of tilt. */
const SKY_PIXELS_PER_TURN = 900;
/** The near layer's tile; the sky is kept within one so the numbers never grow. */
const SKY_TILE = { x: 1600, y: 1000 };

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
  const stillPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let world: World;
  let rotation = 0.6;
  let tilt = -0.38;
  let spinning = !stillPreferred;
  let dragging: { x: number; y: number } | null = null;
  let lastFrame = performance.now();

  // The page's sky, if it has one, follows: the script takes over from the CSS drift.
  const sky = document.documentElement;
  const hasSky = sky.dataset["sky"] === "stars";
  let skyX = 0;
  let skyY = 0;
  let skyWritten = "";
  if (hasSky) sky.classList.add("sky-driven");
  // A turn about the vertical axis slides the sky sideways; a tilt slides it up or down.
  // The style is only touched when it would move by half a pixel, so a slow drift does not repaint every frame.
  const slideSky = (turn: number, tilted = 0) => {
    if (!hasSky) return;
    const perRadian = SKY_PIXELS_PER_TURN / (Math.PI * 2);
    skyX = (((skyX - turn * perRadian) % SKY_TILE.x) + SKY_TILE.x) % SKY_TILE.x;
    skyY = (((skyY + tilted * perRadian) % SKY_TILE.y) + SKY_TILE.y) % SKY_TILE.y;
    const wanted = `${(Math.round(skyX * 2) / 2).toFixed(1)}px ${(Math.round(skyY * 2) / 2).toFixed(1)}px`;
    if (wanted === skyWritten) return;
    skyWritten = wanted;
    const [x, y] = wanted.split(" ");
    sky.style.setProperty("--sky-x", x ?? "0px");
    sky.style.setProperty("--sky-y", y ?? "0px");
  };

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
    image.data.set(renderSphere(world, SIZE, { rotation, tilt }));
    context.putImageData(image, 0, 0);
  };

  let frame = 0;
  const tick = (now: number) => {
    const seconds = (now - lastFrame) / 1000;
    if (spinning && !dragging) {
      rotation += (seconds / TURN_SECONDS) * Math.PI * 2;
      paint();
    }
    if (!dragging) slideSky((seconds / SKY_SECONDS) * Math.PI * 2);
    lastFrame = now;
    frame = requestAnimationFrame(tick);
  };

  canvas.addEventListener("pointerdown", (event) => {
    dragging = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const scale = canvas.clientWidth || SIZE;
    const turned = ((event.clientX - dragging.x) / scale) * Math.PI;
    rotation += turned;
    const before = tilt;
    tilt = Math.max(-1.2, Math.min(1.2, tilt - ((event.clientY - dragging.y) / scale) * Math.PI));
    slideSky(turned, tilt - before);
    dragging = { x: event.clientX, y: event.clientY };
    paint();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = null;
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = null;
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
      dial("levels", "Detail", 2, 5, 1, (v) => `${v} splits`),
      dial("roughness", "Roughness", 0.05, 0.5, 0.01, (v) => v.toFixed(2)),
      dial("share", "Sea", 0.2, 0.85, 0.01, (v) => `${Math.round(v * 100)}%`),
    ),
    caption,
  );

  grow();
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    sky.classList.remove("sky-driven");
    sky.style.removeProperty("--sky-x");
    sky.style.removeProperty("--sky-y");
  };
}
