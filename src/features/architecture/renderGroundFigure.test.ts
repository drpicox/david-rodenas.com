import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { renderGroundFigure } from "./renderGroundFigure";

const life = (id: number, path: string, went?: number): Life => ({ id, path, lines: 1, test: path.endsWith(".test.ts"), typesOnly: false, born: 0, changed: [], ...(went === undefined ? {} : { went }) });
const lives = [life(0, "main.ts"), life(1, "platform/page/render.ts"), life(2, "features/f/fFeature.ts"), life(3, "features/f/quiet.ts"), life(4, "core/gone.ts", 3), life(5, "a.test.ts")];
const ground = new Map([
  [0, { expected: 12, actual: 10 }],
  [1, { expected: 1.5, actual: 15 }],
  [2, { expected: 3, actual: 0 }],
  [3, { expected: 0, actual: 0 }],
  [4, { expected: 5, actual: 1 }],
  [5, { expected: 9, actual: 9 }],
]);

describe("the figure of what each file's ground predicted", () => {
  const figure = renderGroundFigure(ground, lives);

  it("places every file that ships and stands by what its ground made likely across and what it had up, the line where they agree drawn", () => {
    expect(figure.match(/<circle class="file/g)).toHaveLength(4);
    expect(figure).toContain('class="even"');
  });

  it("names the files furthest above the line, and furthest below it", () => {
    expect(figure).toMatch(/<text class="name above"[^>]*>render\.ts</);
    expect(figure).toMatch(/<text class="name below"[^>]*>fFeature\.ts</);
  });

  it("says which stand on the most that moved, which changed for reasons of their own, and which were spared", () => {
    expect(figure).toContain("The files whose ground would lead one to expect the most changes: main.ts (12), features/f/fFeature.ts (3) and platform/page/render.ts (1.5)");
    expect(figure).toContain("The ones that changed far more than theirs would: platform/page/render.ts (15 against 1.5)");
    expect(figure).toContain("The ones that changed far less: features/f/fFeature.ts (0 against 3)");
  });

  it("keys its colours: far above its ground, far below it, and near the line", () => {
    expect(figure).toMatch(/class="changes-legend"[\s\S]*changed far more than its ground would lead one to expect[\s\S]*far less[\s\S]*about as much/);
  });
});
