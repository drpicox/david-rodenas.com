import { describe, expect, it } from "vitest";
import { stepMethodOf } from "./stepMethodOf";

describe("a sentence, read as a method", () => {
  it("is named by its words, joined as a method name is", () => {
    expect(stepMethodOf("Go to the blog section,").name).toBe("goToTheBlogSection");
  });

  it("takes a quoted string as an argument, and says so in the name with an S", () => {
    const step = stepMethodOf('The last post title should be "Hello Blog", this post');
    expect(step.name).toBe("theLastPostTitleShouldBeSThisPost");
    expect(step.arguments).toEqual([{ value: '"Hello Blog"', name: "expected", type: "String" }]);
  });

  it("takes a number as an argument, and says so with an N", () => {
    const step = stepMethodOf("There should be 3 cards in the hand of \"Ada\"");
    expect(step.name).toBe("thereShouldBeNCardsInTheHandOfS");
    expect(step.arguments.map((argument) => [argument.name, argument.type])).toEqual([
      ["expected", "int"],
      ["s1", "String"],
    ]);
  });

  it("names the arguments of a sentence that expects nothing by their kind, counted", () => {
    expect(stepMethodOf('Move "Ada" from 2 to 5').arguments.map((argument) => argument.name)).toEqual(["s1", "n1", "n2"]);
  });

  it("skips what is neither a word, a number nor a quote", () => {
    expect(stepMethodOf("* Go -- to the (blog) section!").name).toBe("goToTheBlogSection");
  });
});
