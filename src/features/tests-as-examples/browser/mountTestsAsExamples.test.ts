// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountTestsAsExamples } from "./mountTestsAsExamples";

function mounted(): HTMLElement {
  const host = document.createElement("div");
  mountTestsAsExamples(host);
  return host;
}

function choose(host: HTMLElement, name: string): void {
  const input = host.querySelector<HTMLInputElement>(`input[value="${name}"]`)!;
  input.checked = true;
  input.dispatchEvent(new Event("change"));
}

describe("the same tests, against the dispatcher a reader chooses", () => {
  it("starts with the original dispatcher, the one the tests imply, and every test green", () => {
    const host = mounted();
    expect(host.querySelector("figcaption")?.textContent).toContain("original");
    expect(host.querySelectorAll(".test-results li.red")).toHaveLength(0);
  });

  it("runs them again against the one chosen", () => {
    const host = mounted();
    choose(host, "refactored");
    expect(host.querySelector("figcaption")?.textContent).toContain("refactored");
    expect(host.querySelectorAll(".test-results li.red")).toHaveLength(2);
  });
});
