// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountBowlingKata } from "./mountBowlingKata";

function mounted(): HTMLElement {
  const host = document.createElement("div");
  mountBowlingKata(host);
  return host;
}

describe("the kata, walked in the page", () => {
  it("starts at the empty project, red", () => {
    const host = mounted();
    expect(host.querySelector(".kata-move")?.textContent).toContain("commit 0");
    expect(host.querySelector(".kata-bar")?.className).toContain("red");
  });

  it("goes a commit forward and back with the buttons, and cannot go past either end", () => {
    const host = mounted();
    const [previous, next] = [...host.querySelectorAll("button")];
    expect(previous?.disabled).toBe(true);
    next?.click();
    next?.click();
    expect(host.querySelector(".kata-move")?.textContent).toContain("commit 2");
    expect(host.querySelector(".kata-bar")?.className).toContain("green");
    previous?.click();
    expect(host.querySelector(".kata-move")?.textContent).toContain("commit 1");
  });

  it("jumps to any commit from the strip", () => {
    const host = mounted();
    host.querySelector<HTMLElement>('[data-commit="40"]')?.click();
    expect(host.querySelector(".kata-bar")?.textContent).toBe('Expected: "fail". Received: 300.');
  });

  it("walks with the arrow keys", () => {
    const host = mounted();
    host.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(host.querySelector(".kata-move")?.textContent).toContain("commit 1");
  });
});
