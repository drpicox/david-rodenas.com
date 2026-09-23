import type { LightRobot } from "./LightRobot";
import type { Rule } from "./Rule";

const MOTORS = ["row motor", "column motor"];
const MOVES = [
  ["one up", "not at all", "one down"],
  ["one left", "not at all", "one right"],
];
const READINGS = [
  ["the light is above", "the light is level", "the light is below"],
  ["the light is to the left", "the light is level", "the light is to the right"],
];

/** The middle of a text cell, in a drawing where a cell is one unit wide and two tall: the screen's own shape. */
const across = (column: number) => column - 0.5;
const down = (row: number) => row * 2 - 1;

function rule(motor: number, scanner: number, known: Rule | null): string {
  const says = known ? `when ${READINGS[scanner]![known.reading + 1]}, the ${MOTORS[motor]} moves <b>${MOVES[motor]![known.move + 1]}</b>` : `the ${MOTORS[motor]}, by the ${scanner === 0 ? "row" : "column"} scanner: <i>not yet</i>`;
  return `<li${known ? "" : ' class="unknown"'}>${says}</li>`;
}

/**
 * The screen of the original — 80 columns, 25 rows, an R and a star — with
 * the path the R took, and beside it the four rules as it has written them.
 */
export function renderRobot(robot: LightRobot, turn: number, trail: readonly (readonly [number, number])[]): string {
  const path = trail.map(([row, column]) => `${across(column)},${down(row)}`).join(" ");
  const char = (row: number, column: number, text: string, kind: string) => `<text class="${kind}" x="${across(column)}" y="${(down(row) + 0.6).toFixed(1)}" text-anchor="middle">${text}</text>`;
  const screen =
    `<svg class="screen" viewBox="0 0 80 50" role="img" aria-label="the robot at row ${robot.x}, column ${robot.y}; the light at row ${robot.lx}, column ${robot.ly}">` +
    `<rect class="glass" width="80" height="50"/>` +
    (trail.length > 1 ? `<polyline class="trail" points="${path}"/>` : "") +
    char(robot.lx, robot.ly, "*", "light") +
    char(robot.x, robot.y, "R", "robot") +
    `</svg>`;
  const tried = robot.motors[robot.testing]!;
  const motor = MOTORS[robot.testing];
  const doing = !robot.learning
    ? "it has all four rules, and follows its rules"
    : turn === 0
      ? "it knows nothing yet"
      : `trying the ${tried === 0 ? `${motor} standing still` : `${motor}, ${MOVES[robot.testing]![tried + 1]}`}, to see if it gets closer`;
  const rules = robot.rules.flatMap((known, motor) => known.map((one, scanner) => rule(motor, scanner, one))).join("");
  return `<div class="light-robot">${screen}<p class="doing">Turn ${turn}: ${doing}.</p><ol class="rules">${rules}</ol></div>`;
}
