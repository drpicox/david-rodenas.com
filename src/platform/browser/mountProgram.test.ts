// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { askProgram } from "./askProgram";
import { mountProgram } from "./mountProgram";

function mounted(): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = "<p>the still</p>";
  mountProgram(aProgram)(host, { site: undefined as never });
  return host;
}

const slide = (host: HTMLElement, name: string, position: number) => {
  const input = host.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  input.value = String(position);
  input.dispatchEvent(new Event("input"));
};

describe("a program on its page, once the script is there", () => {
  it("takes the still's place with a dial for each parameter, and the run they start at", () => {
    const host = mounted();
    expect(host.textContent).not.toContain("the still");
    expect([...host.querySelectorAll("label")].map((label) => label.textContent)).toEqual(["Sum: 100 €", "Rate: 10", "Years: 2"]);
    expect(host.querySelector(".program-figure")?.textContent).toBe("121 €");
  });

  it("runs again when a dial moves, and writes the line that would have asked for it", () => {
    const host = mounted();
    slide(host, "years", 0);
    expect(host.querySelector(".program-figure")?.textContent).toBe("100 €");
    expect(host.querySelector(".program-line")?.textContent).toBe("$ savings --years 0");
  });

  it("slides a quantity that spans many sizes along its logarithm", () => {
    const host = mounted();
    slide(host, "sum", 3);
    expect(host.querySelector("label")?.textContent).toBe("Sum: 1000 €");
    expect(host.querySelector(".program-figure")?.textContent).toBe("1210 €");
  });

  it("is asked from outside, as an agent asks it, and moves its dials to say so", () => {
    const host = mounted();
    askProgram(host, { sum: 100, rate: 0, years: 5 });
    expect(host.querySelector(".program-figure")?.textContent).toBe("100 €");
    expect(host.querySelector<HTMLInputElement>('input[name="rate"]')?.value).toBe("0");
    expect(host.querySelector(".program-line")?.textContent).toBe("$ savings --rate 0 --years 5");
  });
});
