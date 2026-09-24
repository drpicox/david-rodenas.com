// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountFibergochi } from "./mountFibergochi";

const press = (host: HTMLElement, does: string) => host.querySelector<HTMLElement>(`[data-do="${does}"]`)!.click();
const clock = (host: HTMLElement) => host.querySelector("[data-show=clock]")!.textContent;
const picture = (host: HTMLElement) => host.querySelector("img[data-show=picture]")!.getAttribute("src");

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("the Fibergochi, once the script is there", () => {
  it("lives a step a second to begin with, the slowest of the three speeds of 1999, three to an hour", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    expect(clock(host)).toBe("1, 0:00h (1)");
    vi.advanceTimersByTime(3000);
    expect(clock(host)).toBe("1, 1:30h (1)");
  });

  it("goes from slow to normal to fast and round again with the speed key, as it did", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    press(host, "speed");
    expect(host.querySelector('[data-do="speed"]')!.textContent).toContain("normal");
    vi.advanceTimersByTime(1200);
    expect(clock(host)).toBe("1, 1:30h (1)");
    press(host, "speed");
    expect(host.querySelector('[data-do="speed"]')!.textContent).toContain("fast");
    press(host, "speed");
    expect(host.querySelector('[data-do="speed"]')!.textContent).toContain("slow");
  });

  it("stands still while it is paused", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    press(host, "pause");
    vi.advanceTimersByTime(5000);
    expect(clock(host)).toBe("1, 0:00h (1)");
    expect(host.textContent).toContain("go on");
  });

  it("shakes its head at begging, and keeps the focus on the key that was pressed", () => {
    const host = document.createElement("div");
    document.body.append(host);
    mountFibergochi(host);
    const beg = host.querySelector<HTMLElement>('[data-do="beg"]')!;
    beg.focus();
    beg.click();
    vi.advanceTimersByTime(500);
    expect(picture(host)).toMatch(/\/no\d\.gif$/);
    expect(document.activeElement).toBe(beg);
    host.remove();
  });

  it("has every drawing asked for as soon as it starts, in a place nobody sees", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    const hidden = host.querySelectorAll("[hidden] img");
    expect(hidden.length).toBe(51);
  });

  it("turns the drawing in the same picture, so the last one stays until the next is there", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    const before = host.querySelector("img[data-show=picture]");
    press(host, "beg");
    vi.advanceTimersByTime(500);
    expect(host.querySelector("img[data-show=picture]")).toBe(before);
    expect(picture(host)).toMatch(/\/no\d\.gif$/);
  });

  it("marks what a lamp means when it is pressed", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    host.querySelector<HTMLElement>('button.lamp[data-lamp="terminal"]')!.click();
    expect(host.querySelector(".legend .picked")?.getAttribute("data-lamp")).toBe("terminal");
  });

  it("is kept in the browser, and found again on the next visit", () => {
    const first = document.createElement("div");
    const stop = mountFibergochi(first);
    vi.advanceTimersByTime(3000);
    stop();
    const second = document.createElement("div");
    mountFibergochi(second);
    expect(clock(second)).toBe("1, 1:30h (1)");
  });

  it("starts over only once asked twice", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    vi.advanceTimersByTime(3000);
    press(host, "new");
    expect(host.textContent).toContain("Are you sure you want a new Fibergochi?");
    press(host, "new-yes");
    expect(clock(host)).toBe("1, 0:00h (1)");
  });

  it("stops living when the page it is on goes", () => {
    const host = document.createElement("div");
    const stop = mountFibergochi(host);
    stop();
    vi.advanceTimersByTime(5000);
    expect(clock(host)).toBe("1, 0:00h (1)");
  });
});
