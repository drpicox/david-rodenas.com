import { describe, expect, it } from "vitest";
import { renderStepCode } from "./renderStepCode";

const post = ["Go to the blog section,", "You should see a list of posts,", 'The last post title should be "Hello Blog", this post'];
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"');

describe("the tests a post becomes", () => {
  const html = renderStepCode(post);

  it("is a call for each sentence, in the order written, in Java and in JavaScript", () => {
    expect(text(html)).toContain("context.goToTheBlogSection();");
    expect(text(html)).toContain('context.theLastPostTitleShouldBeSThisPost("Hello Blog");');
    expect(html.match(/class="step-test/g)).toHaveLength(2);
  });

  it("keeps each sentence beside its call, as a comment", () => {
    expect(text(html)).toMatch(/context\.goToTheBlogSection\(\);\s+\/\/ Go to the blog section,/);
  });

  it("gives the methods still to write, once each, typed in Java", () => {
    expect(text(html)).toContain("public void theLastPostTitleShouldBeSThisPost(String expected) {");
    expect(text(html)).toContain("theLastPostTitleShouldBeSThisPost(expected) {");
  });

  it("leaves out a line with no words in it", () => {
    expect(text(renderStepCode(["", "  --  "]))).not.toContain("context.");
  });
});
