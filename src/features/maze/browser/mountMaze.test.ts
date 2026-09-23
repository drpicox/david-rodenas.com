// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountMaze } from "./mountMaze";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const label = (host: HTMLElement) => host.querySelector("svg")!.getAttribute("aria-label");

afterEach(() => vi.useRealTimers());

describe("the maze, once the script is there", () => {
  it("starts on the maze the build drew, the one of 20 May 2001", () => {
    const host = document.createElement("div");
    mountMaze(host);
    expect(label(host)).toBe("A 7 by 7 maze with 4 spheres.");
    expect(host.textContent).toContain("19 rooms long");
  });

  it("grows the version of 13 May, with no spheres, when they are unticked", () => {
    const host = document.createElement("div");
    mountMaze(host);
    const box = host.querySelector<HTMLInputElement>("input[type=checkbox]")!;
    box.checked = false;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    expect(label(host)).toBe("A 7 by 7 maze with 0 spheres.");
  });

  it("grows another from a new seed, at the size on the dial", () => {
    const host = document.createElement("div");
    mountMaze(host);
    const size = host.querySelector<HTMLInputElement>("input[type=range]")!;
    size.value = "15";
    size.dispatchEvent(new Event("input", { bubbles: true }));
    expect(label(host)).toMatch(/^A 15 by 15 maze/);
    const seed = host.querySelector<HTMLInputElement>("input[type=number]")!;
    press(host, "another");
    expect(seed.value).not.toBe("543");
  });

  it("shows the way out on request, and walks the camera's route step by step", () => {
    vi.useFakeTimers();
    const host = document.createElement("div");
    mountMaze(host);
    press(host, "show the way out");
    expect(host.querySelector(".way")).not.toBeNull();
    press(host, "walk the camera");
    vi.advanceTimersByTime(1000);
    expect(host.querySelector(".trail")).not.toBeNull();
    press(host, "stop");
    expect(host.textContent).toContain("walk the camera");
  });
});
