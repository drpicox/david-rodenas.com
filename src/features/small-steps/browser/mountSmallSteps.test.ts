// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountSmallSteps } from "./mountSmallSteps";

describe("small steps, playing in the page", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const classes = (host: HTMLElement) => [...host.querySelectorAll("li")].map((li) => li.className);

  it("starts empty, puts a failing test in red, and shows it put right before the next step", () => {
    const host = document.createElement("div");
    const stop = mountSmallSteps(host);
    expect(classes(host).every((mark) => mark === "empty")).toBe(true);
    vi.advanceTimersByTime(230);
    expect(classes(host)[0]).toBe("red");
    vi.advanceTimersByTime(1000);
    expect(classes(host)[0]).toBe("fixed");
    stop();
  });

  it("rests on a row all green after its rounds, and plays again with its button still there", () => {
    const host = document.createElement("div");
    mountSmallSteps(host);
    vi.advanceTimersByTime(120_000);
    expect(classes(host).every((mark) => mark === "fixed" || mark === "clean")).toBe(true);
    host.querySelector<HTMLButtonElement>("button.player")?.click();
    expect(host.querySelector("button.player")?.getAttribute("aria-label")).toBe("Pause");
    expect(classes(host).every((mark) => mark === "empty")).toBe(true);
  });

  it("stops when the page it is on goes away", () => {
    const host = document.createElement("div");
    const stop = mountSmallSteps(host);
    stop();
    const before = classes(host).join();
    vi.advanceTimersByTime(5000);
    expect(classes(host).join()).toBe(before);
  });
});
