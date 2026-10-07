// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { Example } from "../../blueprint/examplesOf";
import { openExamples } from "./openExamples";

const example = (title: string, about = ""): Example => ({ title, slug: title.toLowerCase(), about, text: "" });

describe("the page's blueprints, to open one", () => {
  it("lists each by its title and what it is about, marks the one open, and gives the one chosen, closing", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const [nights, bars] = [example("Nights", "The nights alone."), example("Bars")];
    const taken: Example[] = [];
    openExamples(host, [nights, bars], nights, (chosen) => taken.push(chosen));
    const buttons = [...host.querySelectorAll<HTMLButtonElement>(".wb-examples li button")];
    expect(buttons.map((button) => [button.querySelector("strong")?.textContent, button.querySelector("span")?.textContent ?? "", button.className])).toEqual([
      ["Nights", "The nights alone.", "current"],
      ["Bars", "", ""],
    ]);
    expect(document.activeElement).toBe(buttons[1]);
    buttons[1]?.click();
    expect(taken).toEqual([bars]);
    expect(host.querySelector(".wb-examples")).toBeNull();
  });
});
