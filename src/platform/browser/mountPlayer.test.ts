// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountPlayer } from "./mountPlayer";

/** A run of three frames, each shown by writing its number, each staying a second. */
function counting(host: HTMLElement) {
  let runs = 0;
  const start = () => {
    runs += 1;
    let frame = 0;
    return () => {
      if (frame === 3) return null;
      frame += 1;
      host.dataset["frame"] = String(frame);
      return 1000;
    };
  };
  return { start, runs: () => runs };
}

describe("a player for what moves on a page", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows each frame in turn, for as long as the frame asks", () => {
    const host = document.createElement("div");
    const run = counting(host);
    mountPlayer(host, run.start);
    expect(host.dataset["frame"]).toBe("1");
    vi.advanceTimersByTime(1000);
    expect(host.dataset["frame"]).toBe("2");
  });

  it("pauses and goes on with its button, which says what pressing it will do", () => {
    const host = document.createElement("div");
    mountPlayer(host, counting(host).start);
    const button = host.querySelector<HTMLButtonElement>("button.player")!;
    expect(button.getAttribute("aria-label")).toBe("Pause");
    button.click();
    expect(button.getAttribute("aria-label")).toBe("Play");
    vi.advanceTimersByTime(5000);
    expect(host.dataset["frame"]).toBe("1");
    button.click();
    vi.advanceTimersByTime(1000);
    expect(host.dataset["frame"]).toBe("3");
  });

  it("rests on the last frame when the run ends, and plays it all again if asked", () => {
    const host = document.createElement("div");
    const run = counting(host);
    mountPlayer(host, run.start);
    vi.advanceTimersByTime(3000);
    const button = host.querySelector<HTMLButtonElement>("button.player")!;
    expect(button.getAttribute("aria-label")).toBe("Play again");
    expect(host.dataset["frame"]).toBe("3");
    button.click();
    expect(run.runs()).toBe(2);
    expect(host.dataset["frame"]).toBe("1");
  });

  it("stops for good when the page it is on goes away, and takes its button with it", () => {
    const host = document.createElement("div");
    const stop = mountPlayer(host, counting(host).start);
    stop();
    vi.advanceTimersByTime(5000);
    expect(host.dataset["frame"]).toBe("1");
    expect(host.querySelector("button")).toBeNull();
  });

  it("leaves the still alone for a reader who asked for less motion", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("matchMedia", matchMedia);
    const host = document.createElement("div");
    mountPlayer(host, counting(host).start);
    expect(host.dataset["frame"]).toBeUndefined();
    expect(host.querySelector("button")).toBeNull();
    vi.unstubAllGlobals();
  });
});
