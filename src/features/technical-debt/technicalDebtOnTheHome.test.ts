// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountProgram } from "../../platform/browser/mountProgram";
import { technicalDebtProgram } from "./technicalDebtProgram";

/**
 * The home shows the technical-debt simulation small, `::technical-debt
 * --shortcuts`: the program says what its dials and its glance are, and the
 * frame's mountProgram is what shows only the one the page names. The two have
 * changed together each time a program learnt something new, and this is what
 * they agree on, where the home uses it.
 */
describe("the technical-debt simulation, as the home shows it", () => {
  const home = () => {
    const host = document.createElement("div");
    host.dataset["dials"] = "shortcuts";
    mountProgram(technicalDebtProgram)(host, { site: undefined as never });
    return host;
  };

  it("has only the dial the page names, and its glance: the chart of what each team has delivered", () => {
    const host = home();
    expect([...host.querySelectorAll("label")].map((label) => label.textContent)).toEqual(["Shortcuts: 25%"]);
    expect(host.querySelector(".program-figure.glance svg")).not.toBeNull();
  });

  it("runs again when that dial moves, and writes the line that would have asked for it", () => {
    const host = home();
    const input = host.querySelector<HTMLInputElement>('input[name="shortcuts"]');
    if (!input) throw new Error("no dial");
    input.value = "50";
    input.dispatchEvent(new Event("input"));
    expect(host.querySelector(".program-line")?.textContent).toBe("$ technical-debt --shortcuts 50");
  });
});
