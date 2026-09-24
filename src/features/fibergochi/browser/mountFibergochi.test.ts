// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountFibergochi } from "./mountFibergochi";

const press = (host: HTMLElement, does: string) => host.querySelector<HTMLElement>(`[data-do="${does}"]`)!.click();
const clock = (host: HTMLElement) => host.querySelector("[data-show=clock]")!.textContent;
const picture = (host: HTMLElement) => host.querySelector("img")!.getAttribute("src");

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("the Fibergochi, once the script is there", () => {
  it("lives a step every tenth of a second, three to an hour", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    expect(clock(host)).toBe("1, 0:00h (1)");
    vi.advanceTimersByTime(300);
    expect(clock(host)).toBe("1, 1:30h (1)");
  });

  it("stands still while it is paused", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    press(host, "pause");
    vi.advanceTimersByTime(1000);
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
    vi.advanceTimersByTime(100);
    expect(picture(host)).toMatch(/\/no\d\.gif$/);
    expect(document.activeElement).toBe(beg);
    host.remove();
  });

  it("is kept in the browser, and found again on the next visit", () => {
    const first = document.createElement("div");
    const stop = mountFibergochi(first);
    vi.advanceTimersByTime(300);
    stop();
    const second = document.createElement("div");
    mountFibergochi(second);
    expect(clock(second)).toBe("1, 1:30h (1)");
  });

  it("starts over only once asked twice", () => {
    const host = document.createElement("div");
    mountFibergochi(host);
    vi.advanceTimersByTime(300);
    press(host, "new");
    expect(host.textContent).toContain("Are you sure you want a new Fibergochi?");
    press(host, "new-yes");
    expect(clock(host)).toBe("1, 0:00h (1)");
  });

  it("stops living when the page it is on goes", () => {
    const host = document.createElement("div");
    const stop = mountFibergochi(host);
    stop();
    vi.advanceTimersByTime(1000);
    expect(clock(host)).toBe("1, 0:00h (1)");
  });
});
