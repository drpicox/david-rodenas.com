import { growWorld } from "../../core/planet/growWorld";
import { renderSphere } from "../../core/planet/renderSphere";
import type { World } from "../../core/planet/World";
import { HEADER_RECIPE, type WorldRecipe } from "../../core/planet/WorldRecipe";
import { el } from "../dom";
import { forgetHeaderWorld, rememberHeaderWorld, savedHeaderWorld } from "../headerWorld";
import { spinPlanet } from "../spinPlanet";

const SIZE = 360;
const TURN_SECONDS = 60;

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
    if (spinning && !dragging) {
      rotation += ((now - lastFrame) / 1000 / TURN_SECONDS) * Math.PI * 2;
      paint();
    }
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
    rotation += ((event.clientX - dragging.x) / scale) * Math.PI;
    tilt = Math.max(-1.2, Math.min(1.2, tilt - ((event.clientY - dragging.y) / scale) * Math.PI));
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
  return () => cancelAnimationFrame(frame);
}
