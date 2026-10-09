// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { chooser } from "./chooser";
import { searchKeys } from "./searchKeys";
import { searchSite } from "./searchSite";

let input: HTMLInputElement;
let found: HTMLElement;
let list: ReturnType<typeof chooser>;

beforeEach(() => {
  document.body.innerHTML = '<input><div id="found"></div>';
  input = document.querySelector("input")!;
  found = document.querySelector("#found")!;
  list = chooser(searchSite, input, found, "cards", "Type.");
});

describe("a box that lists the pages found", () => {
  it("lists them as the words are typed, the first of them chosen, and says what it is for while it is empty", () => {
    list.show();
    expect(found.textContent).toBe("Type.");
    searchKeys.type(input, "nights");
    expect([...found.querySelectorAll("a")].map((link) => [link.getAttribute("href"), link.classList.contains("chosen")])).toEqual([
      ["/projects/hot-nights/", true],
      ["/projects/sea/", false],
    ]);
  });

  it("moves the choice with the arrows, and follows it on Enter, by a click", () => {
    searchKeys.type(input, "nights");
    const followed: string[] = [];
    found.addEventListener("click", (event) => {
      event.preventDefault();
      followed.push((event.target as Element).closest("a")?.getAttribute("href") ?? "");
    });
    searchKeys.press("ArrowUp", input);
    searchKeys.press("Enter", input);
    expect(followed).toEqual(["/projects/sea/"]);
  });

  it("is emptied, words and all, when cleared", () => {
    searchKeys.type(input, "sea");
    list.clear();
    expect([input.value, found.childElementCount]).toEqual(["", 0]);
  });
});
