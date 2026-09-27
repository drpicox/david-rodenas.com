import { describe, expect, it } from "vitest";
import { KATA_STEPS } from "./KATA_STEPS";
import { runKata } from "./runKata";

/**
 * What the runner said at each commit, as the slides print it — except at
 * commits 32 and 40, where the slides print "Expected: 17" and the runner, run,
 * says otherwise. A step not listed here passes.
 */
const RED: Readonly<Record<number, string>> = {
  0: "Your test suite must contain at least one test.",
  1: "ReferenceError: Game is not defined",
  3: "TypeError: g.roll is not a function",
  5: "TypeError: g.score is not a function",
  6: "Expected: 0. Received: undefined.",
  8: "Expected: 20. Received: 0.",
  17: "Expected: 16. Received: 13.",
  24: "Expected: 16. Received: 13.",
  27: "Expected: 16. Received: 13.",
  32: "Expected: 24. Received: NaN.",
  40: 'Expected: "fail". Received: 300.',
};

describe("the Bowling Game Kata, commit by commit", () => {
  it("has every commit from the empty project to the perfect game, in order", () => {
    expect(KATA_STEPS.map((step) => step.commit)).toEqual(Array.from({ length: 42 }, (_, commit) => commit));
  });

  it("goes red exactly where the slides say, and says why", () => {
    for (const step of KATA_STEPS) {
      const run = runKata(step.test, step.code);
      const failure = RED[step.commit];
      if (failure) {
        expect(run.passed, `commit ${step.commit}`).toBe(false);
        expect(run.message, `commit ${step.commit}`).toBe(failure);
      } else {
        expect(run.passed, `commit ${step.commit}: ${run.message}`).toBe(true);
      }
    }
  });

  it("keeps every clean step green: a refactor is only a refactor if the tests stay green", () => {
    for (const step of KATA_STEPS.filter((one) => one.stage === "clean")) expect(runKata(step.test, step.code).passed, `commit ${step.commit}`).toBe(true);
  });

  it("never adds a test in a clean step: a refactor changes how the code is written, not what is checked", () => {
    const tests = (source: string) => source.split("\n").filter((line) => /^\s*test\(/.test(line)).length;
    for (const step of KATA_STEPS.filter((one) => one.stage === "clean")) expect(tests(step.test), `commit ${step.commit}`).toBeLessThanOrEqual(tests(KATA_STEPS[step.commit - 1]!.test));
  });

  it("changes the design only with the new test set aside and the bar green", () => {
    const aside = KATA_STEPS.filter((step) => step.commit >= 18 && step.commit <= 23);
    for (const step of aside) {
      expect(step.test).toContain('// test("one spare"');
      expect(runKata(step.test, step.code).passed).toBe(true);
    }
  });
});

describe("the runner", () => {
  it("runs each test on a fresh beforeEach and reports the first failure", () => {
    const run = runKata('import Game from "./bowling";\nlet g;\nbeforeEach(() => (g = new Game()));\ntest("a", () => { g.n = 1; expect(g.n).toBe(1); });\ntest("b", () => { expect(g.n).toBe(1); });', "export default class Game {}");
    expect(run.results).toEqual([
      { name: "a", passed: true },
      { name: "b", passed: false, message: "Expected: 1. Received: undefined." },
    ]);
  });

  it("gives the game only to a test that imports it", () => {
    expect(runKata('test("t", () => { new Game(); });', "export default class Game {}").message).toBe("ReferenceError: Game is not defined");
  });

  it("reports a file that does not parse, rather than failing itself", () => {
    expect(runKata('test("t", () => {', "").message).toMatch(/^SyntaxError/);
  });
});
