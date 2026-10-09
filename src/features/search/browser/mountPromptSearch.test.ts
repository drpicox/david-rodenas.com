// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountPromptSearch } from "./mountPromptSearch";
import { searchKeys } from "./searchKeys";
import { SEARCH_PAGE } from "./SEARCH_PAGE";

const { press, choose } = searchKeys;
const prompt = () => document.querySelector<HTMLInputElement>(".terminal input")!;
let stop = () => {};

beforeEach(() => {
  document.body.innerHTML = SEARCH_PAGE;
  choose(null);
  stop = mountPromptSearch();
});
afterEach(() => stop());

describe("searching at the prompt", () => {
  it("takes the reader to the prompt on /, with search typed, and nobody else hears the key", () => {
    choose("prompt");
    const terminal = vi.fn();
    window.addEventListener("keydown", terminal);
    const event = press("/");
    window.removeEventListener("keydown", terminal);
    expect(prompt().value).toBe("search ");
    expect(document.activeElement).toBe(prompt());
    expect(event.defaultPrevented).toBe(true);
    expect(terminal).not.toHaveBeenCalled();
  });

  it("shows the key to press at the end of the prompt, which does the same when pressed", () => {
    choose("prompt");
    document.querySelector<HTMLElement>(".terminal .search-key")!.click();
    expect(prompt().value).toBe("search ");
  });

  it("leaves / to the terminal while search is off, or at another choice", () => {
    expect(press("/").defaultPrevented).toBe(false);
    choose("palette");
    expect(press("/").defaultPrevented).toBe(false);
    expect(prompt().value).toBe("");
  });
});
