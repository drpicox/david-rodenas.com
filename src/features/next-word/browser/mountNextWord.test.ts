// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { Site } from "../../../platform/content/Site";
import { mountNextWord } from "./mountNextWord";

const site = new Site([{ file: "index.md", markdown: "---\ntitle: Home\n---\n\n# Home\n\nzebras gallop. zebras gallop. zebras gallop." }]);
const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const written = (host: HTMLElement) => host.querySelector(".written")?.textContent;

afterEach(() => vi.useRealTimers());

describe("the next-word model, once the script is there", () => {
  it("writes one word more each time it is asked, and starts over when told", () => {
    const host = document.createElement("div");
    mountNextWord(host, { site });
    expect(written(host)).toBe("the");
    press(host, "next word");
    expect(written(host)).toMatch(/^the (cat|dog|car)$/);
    press(host, "start over");
    expect(written(host)).toBe("the");
  });

  it("lets the reader be the dice", () => {
    const host = document.createElement("div");
    mountNextWord(host, { site });
    host.querySelector('[data-word="car"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(written(host)).toBe("the car");
  });

  it("reads the site it stands in when asked to, and starts from the nearest word it then knows", () => {
    const host = document.createElement("div");
    mountNextWord(host, { site });
    const text = host.querySelector("select") as HTMLSelectElement;
    text.value = "site";
    text.dispatchEvent(new Event("change"));
    expect(host.querySelector("caption")?.textContent).toContain("between 4 words");
    // "the" is not in it; "home" is the nearest word that is.
    expect(written(host)).toBe("home");
    press(host, "next word");
    expect(written(host)).toBe("home zebras");
  });

  it("keeps writing on its own until stopped, and stops with the page", () => {
    vi.useFakeTimers();
    const host = document.createElement("div");
    const stop = mountNextWord(host, { site });
    press(host, "write");
    vi.advanceTimersByTime(1100);
    const soFar = written(host) ?? "";
    expect(soFar.split(" ").length).toBeGreaterThan(3);
    stop();
    vi.advanceTimersByTime(2000);
    expect(written(host)).toBe(soFar);
  });
});
