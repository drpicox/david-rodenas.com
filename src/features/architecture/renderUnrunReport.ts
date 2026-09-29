import { plural } from "./plural";
import type { Unrun } from "./unrunOf";

/** Each question, what it is, and what to do about a file that asks it. */
const QUESTIONS: readonly (readonly [Unrun["asks"], string])[] = [
  ["unused", "**Nothing uses it** — it has no purpose, or only a test's: remove it, or move it into the test."],
  ["browser", "**Only a browser runs it** — it is hard to test here: test it in a page, or move what it decides out of the browser."],
  ["unstated", "**A behaviour no test states** — write the test that states it, or remove what has none worth stating."],
];

/**
 * What no test runs, as markdown for the summary of the deploy's run, under
 * the question each file asks: the functions no test ran, the lines, and what
 * to do. Coverage is not a target, and this is not a gate: it says where to
 * look, and why.
 */
export function renderUnrunReport(unrun: readonly Unrun[], most = 12): string {
  const head = ["### What no test runs, and what it asks", ""];
  if (unrun.length === 0) return [...head, "The tests run every line a test could run.", ""].join("\n");
  const size = ({ lines }: Unrun) => lines.reduce((sum, [from, to]) => sum + to - from + 1, 0);
  const line = (one: Unrun) => {
    const functions = one.functions.map(({ name, line: at }) => `\`${name}\` (line ${at})`).join(", ");
    const lines = one.lines.map(([from, to]) => (from === to ? `${from}` : `${from}–${to}`)).join(", ");
    return `- \`src/${one.path}\`: ${plural(size(one), "line")}${functions ? ` — ${functions}` : ""}${lines ? `; lines ${lines}` : ""}`;
  };
  const sections = QUESTIONS.flatMap(([asks, said]) => {
    const files = unrun.filter((one) => one.asks === asks);
    if (files.length === 0) return [];
    const rest = files.length - most;
    return [said, "", ...files.slice(0, most).map(line), ...(rest > 0 ? [`- and ${plural(rest, "more file")}`] : []), ""];
  });
  return [...head, "A line no test runs asks one of three things: whether it is hard to test, whether it has a purpose at all, or whether it has one no test states.", "", ...sections].join("\n");
}
