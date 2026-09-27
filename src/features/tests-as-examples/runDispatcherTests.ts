import { reported } from "../../platform/testing/reported";
import { runTestFile } from "../../platform/testing/runTestFile";
import type { TestRun } from "../../platform/testing/TestRun";
import { DISPATCHER_TESTS } from "./DISPATCHER_TESTS";

/** The essay's tests — or any others — run against a dispatcher written one way or another. */
export function runDispatcherTests(dispatcherSource: string, tests: string = DISPATCHER_TESTS): TestRun {
  let Dispatcher: unknown;
  try {
    Dispatcher = new Function(`${dispatcherSource}\nreturn Dispatcher;`)();
  } catch (error) {
    return { passed: false, message: reported(error), results: [] };
  }
  return runTestFile(tests, { Dispatcher });
}
