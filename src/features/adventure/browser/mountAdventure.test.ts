// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mountAdventure } from "./mountAdventure";

const press = (host: HTMLElement, label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const room = (host: HTMLElement) => host.querySelector(".seen h4")?.textContent;

beforeEach(() => localStorage.clear());

describe("the adventure, once the script is there", () => {
  it("moves when a word is pressed, and lights the map as it goes", () => {
    const host = document.createElement("div");
    mountAdventure(host);
    expect(room(host)).toContain("Welcome");
    press(host, "east");
    expect(room(host)).toContain("Use the keys");
    expect(host.querySelectorAll(".cell.seen")).toHaveLength(2);
  });

  it("takes a typed line at its prompt, and says what the game said", () => {
    const host = document.createElement("div");
    mountAdventure(host);
    const input = host.querySelector("input") as HTMLInputElement;
    input.value = "north";
    host.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(host.querySelector(".said")?.textContent).toBe("There is no way out that way.");
  });

  it("keeps the game between visits, and starts over when asked", () => {
    const host = document.createElement("div");
    mountAdventure(host);
    press(host, "take");
    const again = document.createElement("div");
    mountAdventure(again);
    expect(again.querySelector(".status")?.textContent).toContain("weapon:newspaper");
    press(again, "start again");
    expect(again.querySelector(".status")?.textContent).not.toContain("weapon");
  });
});
