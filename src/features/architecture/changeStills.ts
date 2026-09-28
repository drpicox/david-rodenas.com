import type { Still } from "../../platform/plugin/Feature";
import { changeFigures } from "./changeFigures";
import type { Coverage } from "./Coverage";
import { readHistory } from "./readHistory";
import { renderShownCommit } from "./renderShownCommit";

/** Where the figures read the history, and the lines the tests run, as the browser would ask for them. */
const HISTORY = "/data/architecture.json";
const COVERAGE = "/data/coverage.json";

function coverageIn(read: (path: string) => string): Coverage | null {
  try {
    return JSON.parse(read(COVERAGE)) as Coverage;
  } catch {
    return null;
  }
}

/**
 * The page on how the source changes, in the HTML before any script: every
 * figure at the last commit, and the line that says which commit that is,
 * where the player will stand.
 */
export const changeStills: Readonly<Record<string, Still>> = {
  "change-player": (read) => {
    const { history } = readHistory(read(HISTORY));
    return `<p class="shown-commit">${renderShownCommit(history.commits, history.commits.length - 1)}</p>`;
  },
  ...Object.fromEntries(
    Object.entries(changeFigures).map(([name, figure]): [string, Still] => [
      name,
      (read) => {
        const history = readHistory(read(HISTORY));
        return figure(history, history.history.commits.length - 1, coverageIn(read));
      },
    ]),
  ),
};
