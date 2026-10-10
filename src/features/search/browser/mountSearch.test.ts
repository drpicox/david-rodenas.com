// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountSearch } from "./mountSearch";
import { searchKeys } from "./searchKeys";
import { SEARCH_PAGE } from "./SEARCH_PAGE";
import { searchSite } from "./searchSite";

const { press, type } = searchKeys;
const session = () => document.querySelector<HTMLElement>(".session")!;
const above = () => document.querySelector<HTMLInputElement>(".search-input")!;
const below = () => document.querySelector<HTMLInputElement>(".terminal input")!;
const searching = () => session().classList.contains("searching");
let stop = () => {};

beforeEach(() => {
  document.body.innerHTML = SEARCH_PAGE;
  window.scrollTo = vi.fn();
  stop = mountSearch(searchSite);
});
afterEach(() => stop());

describe("searching the site from the header", () => {
  it("turns ls into search on /, and lists the pages found where the directories were, as the words are typed", () => {
    press("/");
    expect(searching()).toBe(true);
    expect(document.activeElement).toBe(above());
    expect(session().querySelector(".search-line")?.textContent).toBe("@drpicox~ $search");
    type(above(), "torrid");
    expect(document.querySelector('.found-here a[href="/projects/hot-nights/"]')?.textContent).toBe("projects/hot-nights/");
  });

  it("opens from the search beside ls, and from the key at the end of the prompt below", () => {
    document.querySelector<HTMLElement>(".search-open")!.click();
    expect(searching()).toBe(true);
    press("Escape", above());
    document.querySelector<HTMLElement>(".terminal .search-key")!.click();
    expect(searching()).toBe(true);
  });

  it("writes the same line at the prompt below as it is typed above, without moving the page down to it", () => {
    const moved = vi.fn();
    below().addEventListener("input", moved);
    const refreshed = vi.fn();
    below().addEventListener("keyup", refreshed);
    press("/");
    type(above(), "torrid nights");
    expect(below().value).toBe("search torrid nights");
    expect(refreshed).toHaveBeenCalled();
    expect(moved).not.toHaveBeenCalled();
  });

  it("follows the one chosen with the arrows on Enter", () => {
    press("/");
    type(above(), "nights");
    const followed: string[] = [];
    document.addEventListener("click", (event) => {
      const link = (event.target as Element).closest("a");
      if (!link) return;
      event.preventDefault();
      followed.push(link.getAttribute("href") ?? "");
    });
    press("ArrowDown", above());
    press("Enter", above());
    expect(followed).toEqual(["/projects/sea/"]);
  });

  it("is ls again on Escape, the words gone above and below", () => {
    press("/");
    type(above(), "sea");
    press("Escape", above());
    expect([searching(), above().value, below().value]).toEqual([false, "", ""]);
  });

  it("leaves the line below to the reader who goes down to it, and closes above", () => {
    press("/");
    type(above(), "sea");
    below().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect([searching(), below().value]).toEqual([false, "search sea"]);
  });

  it("leaves / alone while the reader is typing, as in the prompt, where it is a path", () => {
    expect(press("/", below()).defaultPrevented).toBe(false);
    expect(searching()).toBe(false);
  });
});
