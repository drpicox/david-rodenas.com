import { describe, expect, it } from "vitest";
import { runTestFile } from "./runTestFile";

describe("a test file, run in the page", () => {
  it("runs each test after every beforeEach, in order, and says which passed", () => {
    const run = runTestFile('let n;\nbeforeEach(() => (n = 0));\ntest("one", () => { n += 1; expect(n).toBe(1); });\ntest("again", () => { n += 1; expect(n).toBe(1); });');
    expect(run).toEqual({ passed: true, results: [{ name: "one", passed: true }, { name: "again", passed: true }] });
  });

  it("reports the first failure the way the slides print it, strings quoted", () => {
    const run = runTestFile('test("t", () => { expect(300).toBe("fail"); });');
    expect(run).toMatchObject({ passed: false, message: 'Expected: "fail". Received: 300.' });
  });

  it("hands the tests what the page gives it, and nothing else", () => {
    expect(runTestFile('test("t", () => { expect(answer).toBe(42); });', { answer: 42 }).passed).toBe(true);
    expect(runTestFile('test("t", () => { expect(answer).toBe(42); });').message).toBe("ReferenceError: answer is not defined");
  });

  it("reads describe and it too, naming each test after the block it stands in", () => {
    const run = runTestFile('describe("addListener", () => {\n  it("adds", () => { expect(1).toBe(1); });\n});\ntest("alone", () => {});');
    expect(run.results.map((result) => result.name)).toEqual(["addListener adds", "alone"]);
  });

  it("says a file with no test in it is not yet a test suite", () => {
    expect(runTestFile("// nothing yet").message).toBe("Your test suite must contain at least one test.");
  });

  it("reports a file that does not parse rather than failing itself", () => {
    expect(runTestFile('test("t", () => {').message).toMatch(/^SyntaxError/);
  });

  it("checks that an array holds a thing", () => {
    expect(runTestFile('test("t", () => { expect([1, 2]).toContain(2); });').passed).toBe(true);
    expect(runTestFile('test("t", () => { expect(undefined).toContain(2); });').message).toBe("Expected: something containing 2. Received: undefined.");
  });

  it("gives a stand-in function that remembers how it was called", () => {
    expect(runTestFile('test("t", () => { const cb = fn(); cb("message"); expect(cb).toHaveBeenCalledWith("message"); });').passed).toBe(true);
    expect(runTestFile('test("t", () => { const cb = fn(); expect(cb).toHaveBeenCalledWith("message"); });').message).toBe('Expected: called with "message". Received: never called.');
    expect(runTestFile('test("t", () => { const cb = fn(); cb("other"); expect(cb).toHaveBeenCalledWith("message"); });').message).toBe('Expected: called with "message". Received: called with "other".');
    expect(runTestFile('test("t", () => { const cb = fn(); cb(); expect(cb).toHaveBeenCalledWith("message"); });').message).toBe('Expected: called with "message". Received: called with no arguments.');
  });

  it("names a function in a message the way Jest does, rather than printing its source", () => {
    expect(runTestFile('test("t", () => { expect([]).toContain(fn()); });').message).toBe("Expected: something containing [MockFunction]. Received: [].");
    expect(runTestFile('test("t", () => { expect([]).toContain(function listen() {}); });').message).toBe("Expected: something containing [Function listen]. Received: [].");
  });
});
