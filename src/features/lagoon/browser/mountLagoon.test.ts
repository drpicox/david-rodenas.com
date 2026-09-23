// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mountLagoon } from "./mountLagoon";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const names = (host: HTMLElement) => [...host.querySelectorAll(".board tbody th")].map((cell) => cell.textContent);

beforeEach(() => localStorage.clear());

describe("the lagoon, once the script is there", () => {
  it("plays a round each time it is asked, and starts a new season when told", () => {
    const host = document.createElement("div");
    mountLagoon(host);
    expect(host.textContent).toContain("Nobody has been out yet");
    press(host, "play a round");
    expect(host.textContent).toContain("After 1 round");
    press(host, "play five");
    expect(host.textContent).toContain("After 6 rounds");
    press(host, "new season");
    expect(host.textContent).toContain("Nobody has been out yet");
  });

  it("leaves the 40% bot on the bank until it is ticked, and starts the season again when it is", () => {
    const host = document.createElement("div");
    mountLagoon(host);
    expect(names(host)).not.toContain("40%");
    press(host, "play a round");
    const box = [...host.querySelectorAll<HTMLInputElement>(".bench input")].find((input) => input.parentElement?.textContent?.includes("40%"))!;
    box.checked = true;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    expect(names(host)).toContain("40%");
    expect(host.textContent).toContain("Nobody has been out yet");
  });

  it("seats the visitor's bot when asked, keeps it, and shows its mistakes in the engine's words", () => {
    const host = document.createElement("div");
    mountLagoon(host);
    const editor = host.querySelector("textarea")!;
    editor.value = "return new Array(weeks).fill(2);";
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    press(host, "seat it");
    expect(names(host)).toContain("You");

    const again = document.createElement("div");
    mountLagoon(again);
    expect(names(again)).toContain("You");

    editor.value = "return (;";
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    press(host, "seat it");
    expect(host.querySelector(".error")?.textContent).toMatch(/Unexpected token/);
    expect(names(host)).not.toContain("You");
  });
});
