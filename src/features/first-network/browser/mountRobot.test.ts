// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { robotStill } from "../robotStill";
import { mountRobot } from "./mountRobot";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)!.click();
const tick = (host: HTMLElement, label: string) => {
  const box = [...host.querySelectorAll("label")].find((one) => one.textContent?.includes(label))!.querySelector("input")!;
  box.checked = !box.checked;
  box.dispatchEvent(new Event("change", { bubbles: true }));
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("the robot, once the script is there", () => {
  it("opens on what the build already drew", () => {
    const host = document.createElement("div");
    mountRobot(host);
    const built = document.createElement("div");
    built.innerHTML = robotStill(() => "");
    expect(host.querySelector(".light-robot")!.outerHTML).toBe(built.innerHTML);
  });

  it("takes one turn at a time, or runs until it is stopped", () => {
    const host = document.createElement("div");
    const stop = mountRobot(host);
    press(host, "one turn");
    expect(host.textContent).toContain("Turn 1:");
    press(host, "run");
    vi.advanceTimersByTime(1000);
    press(host, "stop");
    const turn = Number(/Turn (\d+):/.exec(host.textContent ?? "")![1]);
    expect(turn).toBeGreaterThan(5);
    vi.advanceTimersByTime(1000);
    expect(host.textContent).toContain(`Turn ${turn}:`);
    stop();
  });

  it("starts again from nothing on a new run", () => {
    const host = document.createElement("div");
    mountRobot(host);
    for (let turn = 0; turn < 80; turn += 1) press(host, "one turn");
    press(host, "new run");
    expect(host.textContent).toContain("Turn 0:");
    expect(host.querySelectorAll(".rules .unknown")).toHaveLength(4);
  });

  it("has the original's two keys as switches: the light wandering, and the screen wrapping round", () => {
    const host = document.createElement("div");
    mountRobot(host);
    const star = () => host.querySelector(".light")!.getAttribute("x") + "," + host.querySelector(".light")!.getAttribute("y");
    const before = star();
    for (let turn = 0; turn < 30; turn += 1) press(host, "one turn");
    expect(star()).toBe(before);
    tick(host, "the light wanders");
    for (let turn = 0; turn < 30; turn += 1) press(host, "one turn");
    expect(star()).not.toBe(before);
    tick(host, "wraps round");
  });
});
