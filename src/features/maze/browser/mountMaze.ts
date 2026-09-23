import { el } from "../../../platform/browser/el";
import { describeWay } from "../describeWay";
import { growMaze } from "../growMaze";
import type { Maze } from "../Maze";
import { renderMaze } from "../renderMaze";
import { wayOut } from "../wayOut";
import { FIRST } from "../FIRST";

/** A room every tenth of a second: the camera's pace, but a maze of thirty a side still ends in a few minutes. */
const PACE = 100;

/**
 * The generator with its three inputs outside — the size, the seed, and
 * whether it rolls for spheres — and the two things the VRML let you do
 * besides walk it: ride the camera along the dig, and (here, not there) be
 * shown the way out.
 */
export function mountMaze(host: HTMLElement): () => void {
  let maze: Maze;
  let steps = 0;
  let showWay = false;
  let walking: ReturnType<typeof setInterval> | null = null;

  const figure = el("div", { class: "figure" });
  const status = el("p", { class: "status" });
  const sizeShown = el("output", {}, String(FIRST.size));
  const size = el("input", { type: "range", min: 5, max: 30, step: 1, value: FIRST.size, oninput: () => regrow() });
  const seed = el("input", { type: "number", value: FIRST.seed, onchange: () => regrow() });
  const spheres = el("input", { type: "checkbox", checked: true, onchange: () => regrow() });
  const walkButton = el("button", { type: "button", onclick: () => (walking ? stop() : walk()) }, "walk the camera");
  const wayButton = el("button", { type: "button", onclick: () => toggleWay() }, "show the way out");

  function draw(): void {
    figure.innerHTML = renderMaze(maze, { trail: steps, way: showWay ? wayOut(maze) : null });
  }

  function regrow(): void {
    stop();
    steps = 0;
    sizeShown.textContent = size.value;
    maze = growMaze(Number(size.value), Number(size.value), Number(seed.value), { spheres: spheres.checked });
    status.textContent = describeWay(maze);
    draw();
  }

  function walk(): void {
    if (steps >= maze.path.length) steps = 0;
    walkButton.textContent = "stop";
    walking = setInterval(() => {
      steps += 1;
      draw();
      if (steps >= maze.path.length) stop();
    }, PACE);
  }

  function stop(): void {
    if (walking) clearInterval(walking);
    walking = null;
    walkButton.textContent = "walk the camera";
  }

  function toggleWay(): void {
    showWay = !showWay;
    wayButton.textContent = showWay ? "hide the way out" : "show the way out";
    draw();
  }

  const another = el("button", { type: "button", onclick: () => ((seed.value = String(Math.floor(Math.random() * 1e6))), regrow()) }, "another");
  const dials = el(
    "div",
    { class: "dials" },
    el("label", {}, "Rooms a side: ", sizeShown, size),
    el("label", {}, "Seed: ", seed, another),
    el("label", {}, spheres, " spheres, as on 20 May (unticked: 13 May)"),
  );
  host.replaceChildren(el("div", { class: "maze-app" }, figure, status, el("div", { class: "row" }, walkButton, wayButton), dials));
  regrow();
  return stop;
}
