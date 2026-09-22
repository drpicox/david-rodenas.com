// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountPostTests } from "./mountPostTests";

describe("the post compiler, once the script is there", () => {
  it("opens on the first post of the course and its test", () => {
    const host = document.createElement("div");
    mountPostTests(host);
    expect(host.querySelector("textarea")?.value).toContain("# Hello Blog");
    expect(host.querySelector(".compiled")?.textContent).toContain("await context.goToTheBlogSection();");
    expect(host.querySelector(".refused")).toBeNull();
  });

  it("follows the post as it is edited, and says what the compiler said when a rule is broken", () => {
    const host = document.createElement("div");
    mountPostTests(host);
    const post = host.querySelector("textarea") as HTMLTextAreaElement;
    // The compiler checks in the template's order: a "should" somewhere first, then the companion words.
    post.value = "# T\n\n * There are 3 cards.\n * It should be fine.\n";
    post.dispatchEvent(new Event("input"));
    expect(host.querySelector(".refused")?.textContent).toContain('"there" but no "should" or "given"');
    post.value = "# T\n\n * Go north.\n * There should be 3 cards.\n";
    post.dispatchEvent(new Event("input"));
    expect(host.querySelector(".refused")).toBeNull();
    expect(host.querySelector(".compiled")?.textContent).toContain("thereShouldBeNCards(3)");
  });
});
