// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { openHelp } from "./openHelp";

describe("how to use the workbench, said where the hands are", () => {
  it("says what each hand does, first what helps most, and closes by its ✕", () => {
    const host = document.createElement("div");
    openHelp(host);
    const lines = [...host.querySelectorAll(".wb-help li strong")].map((keys) => keys.textContent);
    expect(lines.slice(0, 3)).toEqual(["Choose a node", "Press an output's name", "Drag from a pin"]);
    (host.querySelector(".wb-help-close") as HTMLButtonElement).click();
    expect(host.querySelector(".wb-help")).toBeNull();
  });
});
