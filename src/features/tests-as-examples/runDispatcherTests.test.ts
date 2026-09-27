import { describe, expect, it } from "vitest";
import { DISPATCHERS } from "./DISPATCHERS";
import { runDispatcherTests } from "./runDispatcherTests";

const sourceOf = (name: string) => {
  const dispatcher = DISPATCHERS.find((one) => one.name === name);
  if (!dispatcher) throw new Error(name);
  return dispatcher.source;
};

const passing = (name: string) => Object.fromEntries(runDispatcherTests(sourceOf(name)).results.map((result) => [result.name, result.passed]));

const QUEUE = "addListener should add a callback to the queue";
const INVOKE = "deliver should invoke queue callbacks with the received argument";
const DELIVERS = "delivers messages to listeners";

describe("tests that look inside, and a test that reads like documentation", () => {
  it("all pass against the dispatcher they imply", () => {
    expect(passing("original")).toEqual({ [QUEUE]: true, [INVOKE]: true, [DELIVERS]: true });
  });

  it("the ones that look inside break when the inside changes, and the behaviour did not", () => {
    expect(passing("refactored")).toEqual({ [QUEUE]: false, [INVOKE]: false, [DELIVERS]: true });
  });

  it("the ones that look inside both stay green over a bug where their halves meet, and the documentation test catches it", () => {
    expect(passing("with-a-bug")).toEqual({ [QUEUE]: true, [INVOKE]: true, [DELIVERS]: false });
  });

  it("the refactored dispatcher is a refactoring: a listener added twice is still called twice", () => {
    const twice = 'test("twice", () => { const d = new Dispatcher(); const cb = fn(); d.addListener(cb); d.addListener(cb); d.deliver("m"); expect(cb.calls.length).toBe(2); });';
    for (const name of ["original", "refactored"]) expect(runDispatcherTests(sourceOf(name), twice).passed).toBe(true);
  });
});
