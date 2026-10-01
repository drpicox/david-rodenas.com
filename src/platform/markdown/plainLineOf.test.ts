import { describe, expect, it } from "vitest";
import { plainLineOf } from "./plainLineOf";

describe("a line of markdown, read as a sentence", () => {
  it("keeps a link's words and drops where it goes", () => {
    expect(plainLineOf("- [The Unit Test Trap](https://medium.com/p/4a83e4012b17)  ")).toBe("- The Unit Test Trap");
  });

  it("drops headings, emphasis, code and quotes, and keeps what they marked", () => {
    expect(plainLineOf("## *Why* `npm test` is __red__")).toBe("Why npm test is red");
    expect(plainLineOf("> said once")).toBe("said once");
  });
});
