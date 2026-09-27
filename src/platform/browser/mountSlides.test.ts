// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderSlides } from "../markdown/slides/renderSlides";
import { mountSlides } from "./mountSlides";

function page(): HTMLElement {
  const main = document.createElement("main");
  main.innerHTML = renderSlides(["let a = 1;", "--- red Expected: 2. Received: 1.", "let a = 2;", "--- green All tests pass."].join("\n"), "js");
  return main;
}

const live = (main: HTMLElement) => main.querySelector(".slide.live");

describe("slides, played in the page", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("types the first frame from nothing, with a caret where the next letter goes", () => {
    const main = page();
    mountSlides(main);
    expect(live(main)?.querySelector("code")?.textContent).toBe("l");
    expect(live(main)?.querySelector(".caret")).not.toBeNull();
  });

  it("says how the tests went once the frame is typed, red then green", () => {
    const main = page();
    mountSlides(main);
    vi.advanceTimersByTime(1000);
    expect(live(main)?.querySelector(".slide-status")?.className).toBe("slide-status red");
    vi.advanceTimersByTime(10_000);
    expect(live(main)?.querySelector("code")?.textContent).toBe("let a = 2;");
    expect(live(main)?.querySelector(".slide-status")?.className).toBe("slide-status green");
  });

  it("stops every one of them when the page they are on goes away, leaving the page as it came", () => {
    const main = page();
    const before = main.innerHTML;
    const stop = mountSlides(main);
    stop();
    vi.advanceTimersByTime(10_000);
    expect(main.innerHTML).toBe(before);
  });

  it("can be played again on the same page, with one screen and one button", () => {
    const main = page();
    mountSlides(main)();
    mountSlides(main);
    expect(main.querySelectorAll(".slide.live")).toHaveLength(1);
    expect(main.querySelectorAll("button.player")).toHaveLength(1);
  });
});
