// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountGuessTheRule } from "./mountGuessTheRule";

describe("guess the rule, in the page", () => {
  it("starts with 2, 4, 8 passing, tests what is proposed, and answers a guess", () => {
    const host = document.createElement("div");
    mountGuessTheRule(host, () => 0);
    expect(host.querySelector("tbody")?.textContent).toBe("2,4,8✅");
    const [a, b, c] = [...host.querySelectorAll<HTMLInputElement>('input[type="number"]')];
    a!.value = "3";
    b!.value = "2";
    c!.value = "1";
    host.querySelector<HTMLButtonElement>("button.test")?.click();
    expect(host.querySelector("tbody")?.textContent).toBe("2,4,8✅3,2,1❌");
    const rule = host.querySelector<HTMLInputElement>('input[type="text"]')!;
    rule.value = "a < b && b < c";
    host.querySelector<HTMLButtonElement>("button.guess")?.click();
    expect(host.querySelector('.guess-said[data-said="guess"]')?.textContent).toBe('Good! "a < b && b < c" is the rule.');
  });
});
