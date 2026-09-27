import { describe, expect, it } from "vitest";
import { DISPATCHERS } from "./DISPATCHERS";
import { renderDispatcherRun } from "./renderDispatcherRun";

const [original, refactored] = DISPATCHERS;

describe("the tests, run against one dispatcher", () => {
  it("shows the dispatcher, and says what changed in it", () => {
    const html = renderDispatcherRun(refactored!);
    expect(html).toContain("#listeners");
    expect(html).toContain("Nothing a user of it can see has changed.");
  });

  it("shows each test red or green, with what the runner said when it failed", () => {
    const html = renderDispatcherRun(refactored!);
    expect(html).toMatch(/<li class="red">[^]*should add a callback to the queue[^]*Expected: something containing/);
    expect(html).toMatch(/<li class="green">[^]*delivers messages to listeners/);
  });

  it("keeps the two kinds of test apart: the ones that look inside, and the one that reads like documentation", () => {
    const html = renderDispatcherRun(original!);
    expect(html.indexOf("Looking inside")).toBeLessThan(html.indexOf("should add a callback to the queue"));
    expect(html.indexOf("Reading like documentation")).toBeLessThan(html.indexOf("delivers messages to listeners"));
  });
});
