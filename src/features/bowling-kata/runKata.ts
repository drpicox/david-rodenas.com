import { reported } from "../../platform/testing/reported";
import { runTestFile } from "../../platform/testing/runTestFile";
import type { TestRun } from "../../platform/testing/TestRun";

const IMPORT = /^\s*import Game from "\.\/bowling";\s*$/m;

/**
 * Runs a commit of the kata: the code file as the module it is, then the test
 * file against it. The test is handed the game only if it imports it, so a
 * test that forgets the import fails as it would.
 */
export function runKata(testSource: string, codeSource: string): TestRun {
  let Game: unknown;
  try {
    Game = codeSource.trim() ? new Function(`${codeSource.replace(/export default class Game/, "class Game")}\nreturn Game;`)() : undefined;
  } catch (error) {
    return { passed: false, message: reported(error), results: [] };
  }
  return IMPORT.test(testSource) ? runTestFile(testSource.replace(IMPORT, ""), { Game }) : runTestFile(testSource);
}
