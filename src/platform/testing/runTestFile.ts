import { reported } from "./reported";
import type { TestRun } from "./TestRun";

const standIns = new WeakSet<object>();

/** A value as the slides' runner prints it: strings quoted, functions named as Jest names them, everything else as it reads. */
const shown = (value: unknown): string => {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") return standIns.has(value) ? "[MockFunction]" : `[Function ${value.name || "anonymous"}]`;
  return String(value);
};
const listed = (values: readonly unknown[]) => values.map(shown).join(", ");
const called = (args: readonly unknown[]) => (args.length === 0 ? "called with no arguments" : `called with ${listed(args)}`);

class Mismatch extends Error {}

const said = (error: unknown) => (error instanceof Mismatch ? error.message : reported(error));

/** A stand-in function that remembers every call made to it. */
function fn(): ((...args: unknown[]) => void) & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  const standIn = Object.assign((...args: unknown[]) => void calls.push(args), { calls });
  standIns.add(standIn);
  return standIn;
}

const sameCall = (a: readonly unknown[], b: readonly unknown[]) => a.length === b.length && a.every((value, index) => Object.is(value, b[index]));

function expect(received: unknown) {
  return {
    toBe(expected: unknown) {
      if (!Object.is(received, expected)) throw new Mismatch(`Expected: ${shown(expected)}. Received: ${shown(received)}.`);
    },
    toContain(expected: unknown) {
      if (!Array.isArray(received) || !received.includes(expected)) throw new Mismatch(`Expected: something containing ${shown(expected)}. Received: ${Array.isArray(received) ? `[${listed(received)}]` : shown(received)}.`);
    },
    toHaveBeenCalledWith(...expected: unknown[]) {
      const calls = (received as { calls?: unknown[][] } | undefined)?.calls ?? [];
      if (calls.some((call) => sameCall(call, expected))) return;
      const last = calls[calls.length - 1];
      throw new Mismatch(`Expected: ${called(expected)}. Received: ${last ? called(last) : "never called"}.`);
    },
  };
}

/**
 * Runs a test file written as a Jest one is — `test` or `it` inside any
 * `describe`, `beforeEach`,
 * `expect(…)` with the few matchers the site's examples use, and `fn()` for a
 * stand-in — in the page itself, with nothing to install. The file sees only
 * what it is handed, so a test that reaches for something it was not given
 * fails the way it would. Each test runs after every `beforeEach`, in order.
 */
export function runTestFile(source: string, given: Readonly<Record<string, unknown>> = {}): TestRun {
  const tests: { name: string; body: () => void }[] = [];
  const hooks: (() => void)[] = [];
  const blocks: string[] = [];
  const test = (name: string, body: () => void) => tests.push({ name: [...blocks, name].join(" "), body });
  const describe = (name: string, body: () => void) => {
    blocks.push(name);
    body();
    blocks.pop();
  };
  const names = ["test", "it", "describe", "beforeEach", "expect", "fn", ...Object.keys(given)];
  const values = [test, test, describe, (hook: () => void) => hooks.push(hook), expect, fn, ...Object.values(given)];
  try {
    new Function(...names, source)(...values);
  } catch (error) {
    return { passed: false, message: said(error), results: [] };
  }
  if (tests.length === 0) return { passed: false, message: "Your test suite must contain at least one test.", results: [] };

  const results = tests.map(({ name, body }) => {
    try {
      for (const hook of hooks) hook();
      body();
      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, message: said(error) };
    }
  });
  const failure = results.find((result) => !result.passed);
  return failure ? { passed: false, message: failure.message, results } : { passed: true, results };
}
