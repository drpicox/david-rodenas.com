// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { isTyping } from "./isTyping";

const keyOn = (target: Element) => {
  let typing: boolean | null = null;
  target.addEventListener("keydown", (event) => (typing = isTyping(event)));
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
  return typing;
};

describe("a key pressed while typing", () => {
  it("is one pressed into a box, a text, or something that can be written in", () => {
    document.body.innerHTML = '<input><textarea></textarea><div contenteditable="true"><span id="inside"></span></div><p id="paper"></p>';
    expect(keyOn(document.querySelector("input")!)).toBe(true);
    expect(keyOn(document.querySelector("textarea")!)).toBe(true);
    expect(keyOn(document.querySelector("#inside")!)).toBe(true);
    expect(keyOn(document.querySelector("#paper")!)).toBe(false);
  });
});
