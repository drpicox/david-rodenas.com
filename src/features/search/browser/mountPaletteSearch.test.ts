// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mountPaletteSearch } from "./mountPaletteSearch";
import { searchKeys } from "./searchKeys";
import { SEARCH_PAGE } from "./SEARCH_PAGE";
import { searchSite } from "./searchSite";

const { press, type, choose } = searchKeys;
const palette = () => document.querySelector<HTMLElement>(".palette")!;
const input = () => palette().querySelector<HTMLInputElement>("input")!;
const prompt = () => document.querySelector<HTMLInputElement>(".terminal input")!;
let stop = () => {};

beforeEach(() => {
  document.body.innerHTML = SEARCH_PAGE;
  choose("palette");
  stop = mountPaletteSearch(searchSite);
});
afterEach(() => stop());

describe("searching in a palette", () => {
  it("opens on ⌘K, even from the prompt, and shows the pages found as cards as they are typed", () => {
    prompt().focus();
    press("k", prompt(), { metaKey: true });
    expect(palette().hidden).toBe(false);
    expect(document.activeElement).toBe(input());
    type(input(), "warm");
    expect(palette().querySelector('a.card[href="/projects/sea/"] strong')?.textContent).toBe("The sea");
  });

  it("leaves Ctrl+K to the prompt, where it cuts the rest of the line, but opens on it anywhere else", () => {
    press("k", prompt(), { ctrlKey: true });
    expect(palette().hidden).toBe(true);
    press("k", document.body, { ctrlKey: true });
    expect(palette().hidden).toBe(false);
  });

  it("opens from the glass beside the half-moon, closes on Escape or a click outside it, and puts the reader back", () => {
    prompt().focus();
    document.querySelector<HTMLElement>(".search-open")!.click();
    expect(palette().hidden).toBe(false);
    press("Escape", input());
    expect(palette().hidden).toBe(true);
    press("/");
    palette().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(palette().hidden).toBe(true);
  });

  it("does not open while search is at another choice", () => {
    choose("header");
    press("k", document.body, { metaKey: true });
    expect(palette().hidden).toBe(true);
  });
});
