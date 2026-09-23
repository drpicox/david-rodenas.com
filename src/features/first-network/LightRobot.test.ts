import { describe, expect, it } from "vitest";
import { LightRobot } from "./LightRobot";

const distance = (robot: LightRobot) => Math.hypot(robot.x - robot.lx, robot.y - robot.ly);

describe("the robot of ROBOT2.BAS, that learns to look for the light", () => {
  it("starts somewhere on a text screen of 25 rows and 80 columns, knowing nothing", () => {
    const robot = new LightRobot(1);
    for (const [row, column] of [
      [robot.x, robot.y],
      [robot.lx, robot.ly],
    ]) {
      expect(row).toBeGreaterThanOrEqual(1), expect(row).toBeLessThanOrEqual(25);
      expect(column).toBeGreaterThanOrEqual(1), expect(column).toBeLessThanOrEqual(80);
    }
    expect(robot.rules.flat()).toEqual([null, null, null, null]);
    expect(robot.learning).toBe(true);
  });

  it("while it learns, tries one motor at a time and leaves the other still", () => {
    const robot = new LightRobot(2);
    for (let tick = 0; tick < 60 && robot.learning; tick += 1) {
      robot.tick();
      if (!robot.learning) break; // the turn that writes the last rule already moves by the rules
      expect(robot.motors.filter((motor) => motor !== 0).length).toBeLessThanOrEqual(1);
      expect(robot.motors[1 - robot.testing]).toBe(0);
    }
  });

  it("when a try brings it closer, writes down for that motor what each scanner read and what the motor did", () => {
    const robot = new LightRobot(3);
    robot.x = 10;
    robot.y = 10;
    robot.lx = 20;
    robot.ly = 30;
    robot.testing = 1;
    robot.motors = [0, 1];
    robot.trying = 3;
    robot.tick(); // it measures the distance, then takes one step with the column motor
    expect(robot.rules[1]).toEqual([null, null]);
    robot.tick(); // and finds itself closer
    // It moved right, towards the light: the rule is "light below and right: column motor +1", for both scanners at once.
    expect(robot.rules[1]).toEqual([
      { reading: 1, move: 1 },
      { reading: 1, move: 1 },
    ]);
    expect(robot.rules[0]).toEqual([null, null]);
  });

  it("once all four rules are written, stops trying and moves by them alone, never faster than a cell", () => {
    const robot = new LightRobot(4);
    robot.x = 5;
    robot.y = 5;
    robot.lx = 20;
    robot.ly = 60;
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
    expect(robot.learning).toBe(false);
    robot.tick();
    expect(robot.motors).toEqual([1, 1]);
    expect([robot.x, robot.y]).toEqual([6, 6]);
  });

  it("follows its rules to the letter, so the rule written for the other scanner carries it past the light", () => {
    const robot = new LightRobot(5);
    robot.x = 3;
    robot.y = 7;
    robot.lx = 20;
    robot.ly = 70;
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
    for (let tick = 0; tick < 80; tick += 1) robot.tick();
    // Level with the light at row 20 the row scanner reads 0, but "light to the right: row motor +1" still
    // holds, so it goes on down to the edge; it stops at column 70, where no rule matches any more.
    expect([robot.x, robot.y]).toEqual([25, 70]);
  });

  it("lands on the light when it comes level with it on both scanners at once", () => {
    const robot = new LightRobot(5);
    robot.x = 3;
    robot.y = 7;
    robot.lx = 13;
    robot.ly = 17;
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
    for (let tick = 0; tick < 30; tick += 1) robot.tick();
    expect(distance(robot)).toBe(0);
  });

  it("keeps to the screen, or with the L key comes out on the other side", () => {
    const robot = new LightRobot(6);
    robot.x = 1;
    robot.y = 1;
    robot.lx = 20;
    robot.ly = 40;
    robot.rules = [
      [
        { reading: 1, move: -1 },
        { reading: 1, move: -1 },
      ],
      [
        { reading: 1, move: -1 },
        { reading: 1, move: -1 },
      ],
    ];
    robot.tick();
    expect([robot.x, robot.y]).toEqual([1, 1]);
    robot.wraps = true;
    robot.tick();
    expect([robot.x, robot.y]).toEqual([25, 80]);
  });

  it("leaves the light where it is unless the Q key sets it wandering", () => {
    const still = new LightRobot(7);
    const where = [still.lx, still.ly];
    for (let tick = 0; tick < 50; tick += 1) still.tick();
    expect([still.lx, still.ly]).toEqual(where);
    const wandering = new LightRobot(7);
    wandering.wanders = true;
    for (let tick = 0; tick < 50; tick += 1) wandering.tick();
    expect([wandering.lx, wandering.ly]).not.toEqual(where);
  });

  it("learns its four rules in every run, and ends on a still light in fewer than one run in ten", () => {
    let onTheLight = 0;
    for (let seed = 1; seed <= 500; seed += 1) {
      const robot = new LightRobot(seed);
      for (let tick = 0; tick < 1000 && robot.learning; tick += 1) robot.tick();
      expect(robot.learning).toBe(false);
      for (let tick = 0; tick < 400; tick += 1) robot.tick();
      if (distance(robot) === 0) onTheLight += 1;
    }
    expect(onTheLight).toBeGreaterThan(0);
    expect(onTheLight).toBeLessThan(50);
  });
});
