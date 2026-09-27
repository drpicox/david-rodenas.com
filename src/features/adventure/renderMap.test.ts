import { describe, expect, it } from "vitest";
import { Adventure } from "./Adventure";
import { renderMap } from "./renderMap";

const cellAt = (html: string, where: string) => new RegExp(`<span class="([^"]*)" data-where="${where}"[^>]*>(.*?)</span></span>`).exec(html);

describe("the map, as the game never showed it", () => {
  it("is eight rooms by eight, and a room not yet stood in is fog: no name, no walls, nothing in it", () => {
    const html = renderMap(new Adventure().charted(), [0, 0]);
    expect(html.match(/data-where=/g)).toHaveLength(64);
    expect(cellAt(html, "3,3")?.[1]).toBe("cell");
  });

  it("walls a room where it has no way out, and leaves open where it has", () => {
    const [, classes = ""] = cellAt(renderMap(new Adventure().charted(), [0, 0]), "0,0") ?? [];
    expect(classes.split(" ")).toEqual(expect.arrayContaining(["seen", "here", "wall-n", "wall-s", "wall-w"]));
    expect(classes).not.toContain("wall-e");
  });

  it("marks a door that wants a key, until it is opened", () => {
    const game = new Adventure();
    game.go("este");
    expect(cellAt(renderMap(game.charted(), [0, 1]), "0,1")?.[1]).toContain("door-n");
    game.take();
    game.go("norte");
    expect(cellAt(renderMap(game.charted(), [1, 1]), "0,1")?.[1]).not.toContain("door-n");
  });

  it("draws what a room holds, and the player where the player stands", () => {
    const html = renderMap(new Adventure().charted(), [0, 0]);
    const [, , inside = ""] = cellAt(html, "0,0") ?? [];
    expect(inside).toContain('class="pixel"');
    expect(inside).toContain("Welcome");
    expect(html).toContain('<span class="player">');
  });
});
