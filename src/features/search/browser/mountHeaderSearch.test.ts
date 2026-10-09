// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mountHeaderSearch } from "./mountHeaderSearch";
import { searchKeys } from "./searchKeys";
import { SEARCH_PAGE } from "./SEARCH_PAGE";
import { searchSite } from "./searchSite";

const { press, type, choose } = searchKeys;
const session = () => document.querySelector<HTMLElement>(".session")!;
const input = () => document.querySelector<HTMLInputElement>(".find-input")!;
let stop = () => {};

beforeEach(() => {
  document.body.innerHTML = SEARCH_PAGE;
  choose("header");
  stop = mountHeaderSearch(searchSite);
});
afterEach(() => stop());

describe("searching in the header", () => {
  it("turns ls into find on /, and lists the pages found where the directories were, as they are typed", () => {
    press("/");
    expect(session().classList.contains("finding")).toBe(true);
    expect(document.activeElement).toBe(input());
    type(input(), "torrid");
    expect(document.querySelector('.found-here a[href="/projects/hot-nights/"]')?.textContent).toBe("projects/hot-nights/");
  });

  it("opens from the find beside ls too", () => {
    document.querySelector<HTMLElement>(".find-open")!.click();
    expect(session().classList.contains("finding")).toBe(true);
  });

  it("is ls again on Escape, or on a click elsewhere, the words gone", () => {
    press("/");
    type(input(), "sea");
    press("Escape", input());
    expect([session().classList.contains("finding"), input().value]).toEqual([false, ""]);
    press("/");
    document.querySelector("main")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(session().classList.contains("finding")).toBe(false);
  });

  it("leaves / alone at another choice", () => {
    choose("prompt");
    expect(press("/").defaultPrevented).toBe(false);
    expect(session().classList.contains("finding")).toBe(false);
  });
});
