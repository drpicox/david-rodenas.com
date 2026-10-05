import { describe, expect, it } from "vitest";
import { Camera } from "./Camera";

describe("where the canvas looks", () => {
  it("turns a point of the screen into a point of the blueprint", () => {
    expect(new Camera(100, 50, 2).toWorld(300, 150)).toEqual({ x: 100, y: 50 });
  });

  it("zooms about the pointer, keeping the point under it where it is", () => {
    const camera = new Camera(0, 0, 1);
    const before = camera.toWorld(200, 100);
    camera.zoomAt(200, 100, 1.5);
    expect(camera.zoom).toBe(1.5);
    expect(camera.toWorld(200, 100)).toEqual(before);
  });

  it("never zooms nearer or further than can be read", () => {
    const camera = new Camera();
    camera.zoomAt(0, 0, 100);
    expect(camera.zoom).toBe(2);
    camera.zoomAt(0, 0, 0.0001);
    expect(camera.zoom).toBe(0.25);
  });

  it("fits all of a blueprint in view, centred, never nearer than as it is", () => {
    const camera = new Camera();
    camera.fit({ x: 0, y: 0, width: 1000, height: 200 }, { width: 564, height: 400 });
    expect(camera.zoom).toBe(0.5);
    expect(camera.toWorld(282, 200)).toEqual({ x: 500, y: 100 });
    camera.fit({ x: 40, y: 40, width: 100, height: 100 }, { width: 600, height: 400 });
    expect(camera.zoom).toBe(1);
  });
});
