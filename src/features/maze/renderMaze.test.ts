import { describe, expect, it } from "vitest";
import { growMaze } from "./growMaze";
import { renderMaze } from "./renderMaze";
import { wayOut } from "./wayOut";

const count = (svg: string, pattern: RegExp) => svg.match(pattern)?.length ?? 0;

describe("the maze, drawn", () => {
  it("is a picture a reader of the HTML can be told about: its size and its spheres", () => {
    const svg = renderMaze(growMaze(7, 7, 543));
    expect(svg).toMatch(/^<svg[^>]*role="img"/);
    expect(svg).toContain("7 by 7");
    expect(svg).toContain("4 spheres");
  });

  it("marks both ends of a sphere's jump with the same letter, so a reader can follow it", () => {
    const svg = renderMaze(growMaze(7, 7, 543));
    expect(count(svg, /<circle class="sphere"/g)).toBe(4);
    expect(count(svg, />a<\/text>/g)).toBe(2);
    expect(count(svg, />b<\/text>/g)).toBe(2);
  });

  it("shows a sphere that leads nowhere as a dead one", () => {
    const svg = renderMaze(growMaze(7, 7, 0));
    expect(count(svg, /<circle class="sphere dead"/g)).toBe(1);
    expect(svg).toContain("1 leading nowhere");
  });

  it("draws the camera's route as far as it is asked, and the way out when it is given", () => {
    const maze = growMaze(7, 7, 543);
    expect(renderMaze(maze)).not.toContain('class="trail"');
    expect(renderMaze(maze, { trail: 10 })).toContain('class="trail"');
    expect(renderMaze(maze, { trail: 10 })).toContain('class="walker"');
    expect(renderMaze(maze, { way: wayOut(maze) })).toContain('class="way"');
  });
});
