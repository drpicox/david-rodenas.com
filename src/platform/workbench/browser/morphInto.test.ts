// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { morphInto } from "./morphInto";

describe("markup drawn again over what is there", () => {
  it("looks like the new markup", () => {
    const host = document.createElement("div");
    host.innerHTML = '<p class="a">one</p><span>two</span>';
    morphInto(host, '<p class="b">uno</p><em>dos</em><i>tres</i>');
    expect(host.innerHTML).toBe('<p class="b">uno</p><em>dos</em><i>tres</i>');
  });

  it("keeps an element that is the same one, changing its attributes, so it can be made to move", () => {
    const host = document.createElement("div");
    host.innerHTML = '<svg><rect data-key="bar:2024" height="10"></rect><rect data-key="bar:2025" height="20"></rect></svg>';
    const bar = host.querySelector('[data-key="bar:2025"]');
    morphInto(host, '<svg><rect data-key="bar:2025" height="30"></rect></svg>');
    expect(host.querySelector('[data-key="bar:2025"]')).toBe(bar);
    expect(bar?.getAttribute("height")).toBe("30");
    expect(host.querySelectorAll("rect").length).toBe(1);
  });

  it("finds a keyed element wherever it stands, and puts it where it now goes", () => {
    const host = document.createElement("div");
    host.innerHTML = '<ul><li data-key="a">a</li><li data-key="b">b</li></ul>';
    const b = host.querySelector('[data-key="b"]');
    morphInto(host, '<ul><li data-key="b">b</li><li data-key="a">a</li><li data-key="c">c</li></ul>');
    expect(host.querySelector("ul")?.firstElementChild).toBe(b);
    expect(host.textContent).toBe("bac");
  });
});
