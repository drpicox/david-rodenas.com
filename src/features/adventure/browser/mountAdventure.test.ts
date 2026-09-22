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
    expect(room(host)).toContain("Bienvenida");
    press(host, "este");
    expect(room(host)).toContain("Usa las llaves");
    expect(host.querySelectorAll(".cell.seen")).toHaveLength(2);
  });

  it("takes a typed line at its prompt, and says what the game said", () => {
    const host = document.createElement("div");
    mountAdventure(host);
    const input = host.querySelector("input") as HTMLInputElement;
    input.value = "norte";
    host.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(host.querySelector(".said")?.textContent).toBe("La salida no existe.");
  });

  it("keeps the game between visits, and starts over when asked", () => {
    const host = document.createElement("div");
    mountAdventure(host);
    press(host, "coger");
    const again = document.createElement("div");
    mountAdventure(again);
    expect(again.querySelector(".status")?.textContent).toContain("arma:diario");
    press(again, "empezar de nuevo");
    expect(again.querySelector(".status")?.textContent).not.toContain("arma");
  });
});
