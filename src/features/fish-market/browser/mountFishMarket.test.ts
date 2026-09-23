// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountFishMarket } from "./mountFishMarket";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const names = (host: HTMLElement) => [...host.querySelectorAll(".board tbody th")].map((cell) => cell.textContent);
const sales = (host: HTMLElement) => host.querySelectorAll(".sales li").length;

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("the fish market, once the script is there", () => {
  it("seats the five and sells a lot each time it is asked", () => {
    const host = document.createElement("div");
    mountFishMarket(host);
    expect(names(host).sort()).toEqual(["Hasty", "Patient", "Planner", "Vicente", "Wanda"]);
    press(host, "next lot");
    expect(sales(host)).toBe(1);
    press(host, "whole morning");
    expect(host.textContent).toContain("The floor is empty");
  });

  it("seats the visitor's own agent when asked, and keeps it for next time", () => {
    const host = document.createElement("div");
    mountFishMarket(host);
    const editor = host.querySelector("textarea")!;
    editor.value = "return 0.2;";
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    press(host, "seat it");
    expect(names(host)).toContain("You");

    const again = document.createElement("div");
    mountFishMarket(again);
    expect(again.querySelector("textarea")!.value).toBe("return 0.2;");
    expect(names(again)).toContain("You");
  });

  it("shows a mistake in the visitor's agent in the engine's words, and goes on without it", () => {
    const host = document.createElement("div");
    mountFishMarket(host);
    const editor = host.querySelector("textarea")!;
    editor.value = "return (;";
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    press(host, "seat it");
    expect(host.querySelector(".error")?.textContent).toMatch(/Unexpected token/);
    expect(names(host)).not.toContain("You");
    press(host, "next lot");
    expect(sales(host)).toBe(1);
  });
});
