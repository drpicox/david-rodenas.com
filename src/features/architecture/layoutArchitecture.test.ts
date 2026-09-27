import { describe, expect, it } from "vitest";
import { layoutArchitecture } from "./layoutArchitecture";
import type { Snapshot } from "./Snapshot";

let next = 0;
const file = (path: string, lines = 20) => ({ id: next++, path, lines, test: path.endsWith(".test.ts") });
const files = [
  file("main.ts"),
  file("features/rocket/rocketProgram.ts"),
  file("features/rocket/voyage.ts"),
  file("features/theme/themeCommand.ts"),
  file("platform/program/Program.ts"),
  file("platform/shell/Command.ts"),
  file("platform/shell/Shell.ts", 200),
  file("platform/content/Site.ts"),
  file("platform/shell/Shell.test.ts"),
];
const id = (path: string) => files.find((one) => one.path === path)?.id ?? -1;
const arrow = (from: string, to: string, typeOnly = false) => ({ from: id(from), to: id(to), typeOnly });
const snapshot: Snapshot = {
  modules: files,
  dependencies: [
    arrow("main.ts", "features/rocket/rocketProgram.ts"),
    arrow("main.ts", "features/theme/themeCommand.ts"),
    arrow("features/rocket/rocketProgram.ts", "features/rocket/voyage.ts"),
    arrow("features/rocket/rocketProgram.ts", "platform/program/Program.ts", true),
    arrow("features/theme/themeCommand.ts", "platform/shell/Command.ts", true),
    arrow("platform/program/Program.ts", "platform/shell/Command.ts", true),
    arrow("platform/shell/Shell.ts", "platform/content/Site.ts"),
    arrow("platform/shell/Shell.test.ts", "platform/shell/Shell.ts"),
  ],
};

const layout = layoutArchitecture(snapshot);
const box = (name: string) => layout.boxes.find((one) => one.name === name)!;

describe("the picture of one snapshot", () => {
  it("has a box for each folder of the frame and each feature, and a ball for each file that ships", () => {
    expect(layout.boxes.map((one) => one.name).sort()).toEqual(["features/rocket", "features/theme", "main.ts", "platform/content", "platform/program", "platform/shell"]);
    expect(layout.balls).toHaveLength(8);
  });

  it("stands every box above the boxes it needs, so every arrow between boxes points down", () => {
    for (const link of layout.links) expect(box(link.from).y + box(link.from).height).toBeLessThan(box(link.to).y);
  });

  it("puts every ball inside its box", () => {
    for (const ball of layout.balls) {
      const around = box(ball.box);
      expect(ball.x - ball.radius).toBeGreaterThanOrEqual(around.x);
      expect(ball.x + ball.radius).toBeLessThanOrEqual(around.x + around.width);
      expect(ball.y - ball.radius).toBeGreaterThanOrEqual(around.y);
      expect(ball.y + ball.radius).toBeLessThanOrEqual(around.y + around.height);
    }
  });

  it("lets no two boxes overlap", () => {
    for (const a of layout.boxes)
      for (const b of layout.boxes) {
        if (a === b) continue;
        const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
        expect(apart, `${a.name} and ${b.name}`).toBe(true);
      }
  });

  it("draws the arrows between two boxes as one, and says when all of them need only a type", () => {
    expect(layout.links).toContainEqual(expect.objectContaining({ from: "features/rocket", to: "platform/program", count: 1, typeOnly: true }));
    expect(layout.links).toContainEqual(expect.objectContaining({ from: "main.ts", to: "features/rocket", count: 1, typeOnly: false }));
  });

  it("puts the boxes of each level in a box of its own, the features above the frame they stand on", () => {
    const band = (name: string) => layout.bands.find((one) => one.name === name)!;
    expect(layout.bands.map((one) => one.name)).toEqual(["src", "features", "platform"]);
    expect(band("features").y + band("features").height).toBeLessThan(band("platform").y);
    for (const one of layout.boxes.filter((b) => b.name.startsWith("features/"))) {
      expect(one.y).toBeGreaterThan(band("features").y);
      expect(one.y + one.height).toBeLessThan(band("features").y + band("features").height);
    }
  });

  it("starts an arrow on the bottom of the box that needs and ends it on the top of the one needed, spread along each in the order of the other ends", () => {
    for (const link of layout.links) {
      expect(link.y1).toBe(box(link.from).y + box(link.from).height);
      expect(link.y2).toBe(box(link.to).y);
      expect(link.x2).toBeGreaterThan(box(link.to).x);
      expect(link.x2).toBeLessThan(box(link.to).x + box(link.to).width);
    }
    const intoCommand = layout.links.filter((link) => link.to === "platform/shell").sort((a, b) => a.x2 - b.x2);
    expect(intoCommand.map((link) => link.from)).toEqual([...intoCommand].sort((a, b) => box(a.from).x - box(b.from).x).map((link) => link.from));
  });

  it("makes a long file a bigger ball", () => {
    const radius = (path: string) => layout.balls.find((ball) => ball.path === path)!.radius;
    expect(radius("platform/shell/Shell.ts")).toBeGreaterThan(radius("platform/shell/Command.ts"));
  });

  it("puts the tests in too, when asked, each in the box of the file it tests", () => {
    const withTests = layoutArchitecture(snapshot, { tests: true });
    expect(withTests.balls).toHaveLength(9);
    expect(withTests.balls.find((ball) => ball.test)?.box).toBe("platform/shell");
  });

  it("keeps the files at the top of the source together, a test there among them", () => {
    const rooted: Snapshot = { modules: [...snapshot.modules, { id: 99, path: "architecture.test.ts", lines: 50, test: true }], dependencies: snapshot.dependencies };
    expect(layoutArchitecture(rooted, { tests: true }).bands.map((one) => one.name)).toEqual(["src", "features", "platform"]);
  });

  it("marks boxes caught in a circle, and still draws them", () => {
    const circle: Snapshot = { modules: snapshot.modules, dependencies: [...snapshot.dependencies, arrow("platform/content/Site.ts", "platform/shell/Command.ts"), arrow("platform/shell/Command.ts", "platform/content/Site.ts")] };
    const drawn = layoutArchitecture(circle);
    expect(drawn.boxes.filter((one) => one.cyclic).map((one) => one.name).sort()).toEqual(["platform/content", "platform/shell"]);
  });
});
