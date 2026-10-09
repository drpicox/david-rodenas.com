// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { installSearch } from "./installSearch";
import { searchKeys } from "./searchKeys";
import { SEARCH_PAGE } from "./SEARCH_PAGE";
import { searchSite } from "./searchSite";

beforeEach(() => {
  document.body.innerHTML = SEARCH_PAGE;
});

describe("the ways of searching, put on a page", () => {
  it("are all there, and the one the flag is at answers /: switching the flag switches them, with nothing to reload", () => {
    const stop = installSearch({ run: () => {} }, { site: searchSite });
    expect(document.querySelectorAll(".search-key, .find-open, .search-open, .palette")).toHaveLength(4);
    searchKeys.choose("header");
    searchKeys.press("/");
    expect(document.querySelector(".session")?.classList.contains("finding")).toBe(true);
    searchKeys.press("Escape", document.querySelector(".find-input")!);
    searchKeys.choose("palette");
    searchKeys.press("/");
    expect(document.querySelector<HTMLElement>(".palette")?.hidden).toBe(false);
    stop();
  });

  it("are taken away whole when the site stops them", () => {
    installSearch({ run: () => {} }, { site: searchSite })();
    expect(document.querySelectorAll(".search-key, .find-open, .search-open, .palette, .find-line, .found-here")).toHaveLength(0);
  });
});
