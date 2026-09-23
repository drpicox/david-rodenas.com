import { el } from "../../../platform/browser/el";
import { firstRobot } from "../firstRobot";
import { LightRobot } from "../LightRobot";
import { renderRobot } from "../renderRobot";

/** Slow enough to watch it try a motor and give up on it. */
const PACE = 120;
/** Enough of the path to read what it did, not so much that the screen fills. */
const TRAIL = 400;

/**
 * The screen, the turns, and the original's two keys — Q set the light
 * wandering and L let the robot leave on one side and come back on the other —
 * as switches, since a page cannot count on the keyboard being its own.
 */
export function mountRobot(host: HTMLElement): () => void {
  let robot = firstRobot();
  let turn = 0;
  let trail: [number, number][] = [[robot.x, robot.y]];
  let running: ReturnType<typeof setInterval> | null = null;

  const figure = el("div");
  const runButton = el("button", { type: "button", onclick: () => (running ? stop() : run()) }, "run");
  const wanders = el("input", { type: "checkbox", onchange: () => (robot.wanders = wanders.checked) });
  const wraps = el("input", { type: "checkbox", onchange: () => (robot.wraps = wraps.checked) });

  function draw(): void {
    figure.innerHTML = renderRobot(robot, turn, trail);
  }

  function step(): void {
    robot.tick();
    turn += 1;
    trail = [...trail, [robot.x, robot.y] as [number, number]].slice(-TRAIL);
    draw();
  }

  function run(): void {
    runButton.textContent = "stop";
    running = setInterval(step, PACE);
  }

  function stop(): void {
    if (running) clearInterval(running);
    running = null;
    runButton.textContent = "run";
  }

  function again(): void {
    robot = new LightRobot(Math.floor(Math.random() * 1e9));
    robot.wanders = wanders.checked;
    robot.wraps = wraps.checked;
    turn = 0;
    trail = [[robot.x, robot.y]];
    draw();
  }

  const buttons = el("div", { class: "row" }, el("button", { type: "button", onclick: () => step() }, "one turn"), runButton, el("button", { type: "button", onclick: () => again() }, "new run"));
  const keys = el("div", { class: "row" }, el("label", {}, wanders, " the light wanders (Q)"), el("label", {}, wraps, " the screen wraps round (L)"));

  host.replaceChildren(buttons, keys, figure);
  draw();
  return stop;
}
