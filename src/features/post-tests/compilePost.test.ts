import { describe, expect, it } from "vitest";
import { compilePost } from "./compilePost";

const hello = `---
writer: drpicox
coder: someone
---
# Hello Blog

You can find here the blog.

## How to use the blog

 * Go to the blog section,
 * You should see a list of posts,
 * The last post title should be "Hello Blog", this post
 * Go to the "Hello Blog" post,
 * There should be 2 "Berry" cards.
`;

describe("a post, compiled into its test the way the 2022 template did it", () => {
  const out = compilePost(hello, "2022-07-15_hello_blog.md");

  it("turns each step into a call: the words in camel case, a quoted string an S and an argument, a number an N", () => {
    expect(out.steps.map((step) => step.call)).toEqual([
      "goToTheBlogSection()",
      "youShouldSeeAListOfPosts()",
      'theLastPostTitleShouldBeSThisPost("Hello Blog")',
      'goToTheSPost("Hello Blog")',
      'thereShouldBeNSCards(2, "Berry")',
    ]);
  });

  it("writes the test with every step beside the line it came from, and the headings as comments", () => {
    expect(out.test).toContain('test("2022-07-15_hello_blog.md", async () => {');
    expect(out.test).toContain("const context = new Post_20220715_HelloBlog_Context();");
    expect(out.test).toContain("// ## How to use the blog");
    expect(out.test).toMatch(/await context\.goToTheBlogSection\(\); +\/\/ \* Go to the blog section,/);
    expect(out.test).toContain("await context.afterTest();");
  });

  it("writes the context a student fills in, once, naming the arguments by what they are", () => {
    expect(out.context).toContain("export class Post_20220715_HelloBlog_Context {");
    expect(out.context).toContain("async theLastPostTitleShouldBeSThisPost(expected) {");
    expect(out.context).toContain("async thereShouldBeNSCards(expected, s1) {");
    expect(out.context).toContain("async goToTheBlogSection() {");
  });

  it("finds nothing wrong with a post that follows the rules", () => {
    expect(out.problems).toEqual([]);
  });
});

describe("the rules the compiler enforced, each with what it said", () => {
  const post = (steps: string) => compilePost(`# T\n\n${steps}\n`, "2022-01-01_t.md");

  it("wants at least one step, and at least one with should in it, and should at the end", () => {
    expect(post("No steps here.").problems[0]?.message).toContain("does not have any executable instruction");
    expect(post(" * Go north.\n * Go south.").problems[0]?.message).toContain('contains "should"');
    expect(post(" * You should see it.\n * Go south.").problems[0]?.message).toContain("last");
  });

  it("refuses a step that says given and should at once", () => {
    const { problems } = post(' * Given the cat should be "Tom".\n * It should purr.');
    expect(problems[0]).toMatchObject({ line: 3 });
    expect(problems[0]?.message).toContain('"given" and "should" at the same time');
  });

  it("makes a step with there, is, are, has, have or need say which it is: setup or assertion", () => {
    const { problems } = post(" * There are 3 cards.\n * It should be fine.");
    expect(problems[0]?.message).toContain('"there" but no "should" or "given"');
    expect(post(" * Given there are 3 cards.\n * It should be fine.").problems).toEqual([]);
  });
});
