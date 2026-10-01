import { describe, expect, it } from "vitest";
import { essaysOn } from "./essaysOn";

const PAGE = `# Essays

One every Saturday, on [Medium](https://drpicox.medium.com).

## Testing

The subject most of them are about.

- [The Unit Test Trap](https://medium.com/p/4a83e4012b17)  
  Do you find your unit tests costly? You have fallen into *the trap*.

- [BDD is not E2E](https://medium.com/p/bdd-is-not-e2e-365a58f13097)  
  Why people confuse the two.

## In series

Some of them are courses in disguise.`;

describe("the essays a page lists", () => {
  it("are each link in a list, with the line under it and the subject it is grouped under", () => {
    expect(essaysOn(PAGE)).toEqual([
      { title: "The Unit Test Trap", url: "https://medium.com/p/4a83e4012b17", about: "Testing", said: "Do you find your unit tests costly? You have fallen into the trap." },
      { title: "BDD is not E2E", url: "https://medium.com/p/bdd-is-not-e2e-365a58f13097", about: "Testing", said: "Why people confuse the two." },
    ]);
  });

  it("are none where nothing is listed", () => {
    expect(essaysOn("# Essays\n\nNone yet.")).toEqual([]);
  });
});
