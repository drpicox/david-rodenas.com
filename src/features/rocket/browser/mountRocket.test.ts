// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { askProgram } from "../../../platform/browser/askProgram";
import { mountRocket } from "./mountRocket";

const row = (host: HTMLElement, name: string) => host.querySelector(`tr[data-destination="${name}"]`);
function slide(host: HTMLElement, index: number, value: number): void {
  const input = host.querySelectorAll<HTMLInputElement>('input[type="range"]')[index];
  if (!input) throw new Error("no such dial");
  input.value = String(value);
  input.dispatchEvent(new Event("input"));
}

describe("the rocket, once the script is there", () => {
  it("opens on the first ship, which has to coast to the nearest star", () => {
    const host = document.createElement("div");
    mountRocket(host, { site: undefined as never });
    expect(row(host, "Proxima Centauri")?.className).toBe("chosen coasts");
    expect(row(host, "Proxima Centauri")?.textContent).toContain("65 years");
  });

  it("stops coasting once it is given the twenty ships of fuel the trip takes", () => {
    const host = document.createElement("div");
    mountRocket(host, { site: undefined as never });
    slide(host, 1, Math.log10(20));
    expect(row(host, "Proxima Centauri")?.className).toBe("chosen");
    expect(row(host, "Proxima Centauri")?.textContent).toContain("7 years");
  });

  it("reaches the centre of the galaxy in twenty years of its own, given a perfect engine and the fuel", () => {
    const host = document.createElement("div");
    mountRocket(host, { site: undefined as never });
    slide(host, 0, 1);
    slide(host, 1, 13);
    slide(host, 2, 100);
    expect(row(host, "the centre of the galaxy")?.textContent).toMatch(/20 years.*26,002 years/);
    expect(row(host, "Andromeda")?.textContent).toContain("29 years");
  });

  it("draws the trip whose row is pressed", () => {
    const host = document.createElement("div");
    mountRocket(host, { site: undefined as never });
    row(host, "Mars")?.querySelector("td")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.querySelector("h4")?.textContent).toContain("To Mars");
    expect(row(host, "Mars")?.className).toBe("chosen");
  });

  it("flies where it is asked from outside the page, as an agent asks, and its dial says so", () => {
    const host = document.createElement("div");
    mountRocket(host, { site: undefined as never });
    askProgram(host, { to: "Tau Ceti" });
    expect(row(host, "Tau Ceti")?.className).toBe("chosen coasts");
    expect(host.querySelector<HTMLSelectElement>('select[name="to"]')?.value).toBe("Tau Ceti");
    expect(host.querySelector(".program-line")?.textContent).toBe("$ rocket --to tau-ceti");
  });
});
