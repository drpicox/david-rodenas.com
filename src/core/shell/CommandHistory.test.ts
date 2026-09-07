import { describe, expect, it } from "vitest";
import { CommandHistory } from "./CommandHistory";

describe("CommandHistory", () => {
  it("walks back through what was typed, and forward again to what is being typed", () => {
    const history = new CommandHistory();
    history.add("ls");
    history.add("cd book");
    expect(history.previous("ca")).toBe("cd book");
    expect(history.previous("cd book")).toBe("ls");
    expect(history.previous("ls")).toBe("ls");
    expect(history.next("ls")).toBe("cd book");
    expect(history.next("cd book")).toBe("ca");
    expect(history.next("ca")).toBe("ca");
  });

  it("keeps an edit made while browsing", () => {
    const history = new CommandHistory();
    history.add("ls");
    history.previous("");
    expect(history.next("ls -x")).toBe("");
    expect(history.previous("")).toBe("ls -x");
  });
});
