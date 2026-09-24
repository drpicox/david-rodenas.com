// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { lettersStill } from "../lettersStill";
import { mountLetters } from "./mountLetters";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)!.click();
const cell = (host: HTMLElement, at: number) => host.querySelector<HTMLButtonElement>(`[data-at="${at}"]`)!;
const reads = (host: HTMLElement) => host.querySelector(".reading b")?.textContent;
const answered = (host: HTMLElement) => [...host.querySelectorAll(".answers th")].map((cell) => cell.textContent);

/** Clear the grid, ink a smile, name it and ask for it to be remembered. */
function teachOwn(host: HTMLElement, name: string): void {
  press(host, "clear");
  for (const at of [1, 3, 6, 8, 15, 19, 21, 22, 23]) cell(host, at).click();
  const field = host.querySelector<HTMLInputElement>(".own input")!;
  field.value = name;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  press(host, "remember this drawing");
}

beforeEach(() => localStorage.clear());

describe("the letter reader, once the script is there", () => {
  it("opens on what the build already drew", () => {
    const host = document.createElement("div");
    mountLetters(host);
    expect(host.querySelector(".letters")!.outerHTML).toBe(lettersStill(() => ""));
  });

  it("turns a cell on or off when it is pressed, and reads the drawing again", () => {
    const host = document.createElement("div");
    mountLetters(host);
    expect(cell(host, 0).getAttribute("aria-pressed")).toBe("false");
    cell(host, 0).click();
    expect(cell(host, 0).getAttribute("aria-pressed")).toBe("true");
    press(host, "B");
    expect(reads(host)).toBe("B");
    press(host, "clear");
    expect(host.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0);
  });

  it("teaches more when asked, and forgets everything when told", () => {
    const host = document.createElement("div");
    mountLetters(host);
    press(host, "teach 100 more rounds");
    expect(host.textContent).toContain("300 rounds");
    press(host, "forget everything");
    expect(host.textContent).toContain("not been taught");
  });

  it("takes on another letter when it is ticked, and learns them all again", () => {
    const host = document.createElement("div");
    mountLetters(host);
    const box = [...host.querySelectorAll<HTMLInputElement>(".taught input")].find((input) => input.value === "X")!;
    box.checked = true;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    press(host, "X");
    expect(reads(host)).toBe("X");
    expect(host.querySelectorAll(".answers tr")).toHaveLength(3);
  });

  it("never lets fewer than two letters be taught: with one there is nothing to tell apart", () => {
    const host = document.createElement("div");
    mountLetters(host);
    const box = [...host.querySelectorAll<HTMLInputElement>(".taught input")].find((input) => input.value === "B")!;
    box.checked = false;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    expect(box.checked).toBe(true);
    expect(host.querySelectorAll(".answers tr")).toHaveLength(2);
  });

  it("remembers a drawing of the visitor's own under the name given, teaches it with the rest, and reads it", () => {
    const host = document.createElement("div");
    mountLetters(host);
    teachOwn(host, ":)");
    expect(answered(host)).toEqual(["A", "B", ":)"]);
    expect(reads(host)).toBe(":)");
    press(host, "A");
    expect(reads(host)).toBe("A");
  });

  it("keeps the visitor's letters for the next visit, ready to draw and taught", () => {
    const first = document.createElement("div");
    mountLetters(first);
    teachOwn(first, ":)");
    const again = document.createElement("div");
    mountLetters(again);
    press(again, ":)");
    expect(reads(again)).toBe(":)");
    expect(answered(again)).toContain(":)");
  });

  it("says why a drawing cannot be remembered, and remembers nothing", () => {
    const host = document.createElement("div");
    mountLetters(host);
    teachOwn(host, "A");
    expect(host.querySelector(".own .error")!.textContent).toMatch(/already/);
    expect(answered(host)).toEqual(["A", "B"]);
  });

  it("forgets one of the visitor's letters when asked, and it is gone next time too", () => {
    const host = document.createElement("div");
    mountLetters(host);
    teachOwn(host, ":)");
    host.querySelector<HTMLButtonElement>('button[aria-label="forget :)"]')!.click();
    expect(answered(host)).toEqual(["A", "B"]);
    const again = document.createElement("div");
    mountLetters(again);
    expect(again.querySelector('button[aria-label="forget :)"]')).toBeNull();
  });
});
