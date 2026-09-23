import { describe, expect, it } from "vitest";
import { LightRobot } from "./LightRobot";
import { renderRobot } from "./renderRobot";

describe("the robot's screen", () => {
  it("draws the text screen of the original, eighty columns by twenty-five rows, with the R and the star where they are", () => {
    const robot = new LightRobot(1);
    robot.x = 3;
    robot.y = 10;
    robot.lx = 20;
    robot.ly = 70;
    const html = renderRobot(robot, 0, []);
    expect(html).toContain('viewBox="0 0 80 50"');
    // A cell is one unit wide and two tall; a character stands on the bottom of its cell.
    expect(html).toMatch(/<text[^>]*x="9\.5"[^>]*y="5\.6"[^>]*>R<\/text>/);
    expect(html).toMatch(/<text[^>]*x="69\.5"[^>]*y="39\.6"[^>]*>\*<\/text>/);
  });

  it("lists the four rules, in words, as it writes them", () => {
    const robot = new LightRobot(1);
    expect(renderRobot(robot, 0, []).match(/not yet/g)).toHaveLength(4);
    robot.rules[1]![0] = { reading: 1, move: -1 };
    expect(renderRobot(robot, 0, [])).toMatch(/light is below.*?column motor.*?one left/s);
  });

  it("says what it is doing: which motor it is trying, or that it follows its rules", () => {
    const robot = new LightRobot(1);
    robot.testing = 1;
    robot.motors = [0, 1];
    expect(renderRobot(robot, 0, [])).toContain("Turn 0: it knows nothing yet");
    expect(renderRobot(robot, 12, [])).toMatch(/Turn 12.*trying the column motor, one right/s);
    robot.motors = [0, 0];
    expect(renderRobot(robot, 13, [])).toMatch(/Turn 13.*trying the column motor standing still/s);
    robot.rules = [
      [
        { reading: 1, move: 1 },
        { reading: 1, move: 1 },
      ],
      [
        { reading: 1, move: 1 },
        { reading: 1, move: 1 },
      ],
    ];
    expect(renderRobot(robot, 40, [])).toContain("follows its rules");
  });

  it("leaves a trail behind it, so the path can be read after the robot has gone", () => {
    const robot = new LightRobot(1);
    expect(renderRobot(robot, 3, [
      [1, 1],
      [1, 2],
      [2, 2],
    ])).toMatch(/<polyline[^>]*points="0\.5,1 1\.5,1 1\.5,3"/);
  });
});
