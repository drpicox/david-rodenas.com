import { networkOf } from "./networkOf";
import { propagationCostOf } from "./propagationCostOf";
import type { HistoryRead } from "./readHistory";
import type { Shape } from "./shapeOf";
import { shapesOf } from "./shapesOf";

/** One measure, before and after; `held` when it is one the ratchet holds, so that lower is better. */
interface Measured {
  readonly name: string;
  readonly before: number;
  readonly after: number;
  readonly held?: boolean;
  /** How it is written: a whole number unless said otherwise. */
  readonly said?: (value: number) => string;
}

/** A move as it is written: signed, and nought when it rounds to nothing as written. */
/** What the ratchet holds, by the names the report gives them: for every one of them, lower is better. */
const HELD: readonly (readonly [keyof Shape, string])[] = [
  ["againstStability", "arrows against stability"],
  ["deepestCore", "deepest core"],
  ["tallestStack", "tallest stack"],
  ["untested", "files with something to run that no test imports"],
];

const signed = (value: number, said: (value: number) => string) => (said(Math.abs(value)) === said(0) ? "0" : value > 0 ? `+${said(value)}` : `−${said(-value)}`);

/**
 * How the shape of the source moved between two commits of its history, as a
 * table in markdown for the summary of a run: the size of the network, what
 * the ratchet holds — marked better or worse, since for each of them lower is
 * better — and how the network reads. It is there to be read, not to pass: the
 * ratchet is the test.
 */
export function renderShapeReport(read: HistoryRead, from: number, to: number): string {
  const [before, after] = [read.snapshots[from], read.snapshots[to]];
  const [shapeBefore, shapeAfter] = [shapesOf(read)[from], shapesOf(read)[to]];
  const [commitBefore, commitAfter] = [read.history.commits[from], read.history.commits[to]];
  if (!before || !after || !shapeBefore || !shapeAfter || !commitBefore || !commitAfter) return "";
  const [networkBefore, networkAfter] = [networkOf(before), networkOf(after)];
  const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const tenth = (value: number) => value.toFixed(1);
  const hundredth = (value: number) => value.toFixed(2);
  const measures: Measured[] = [
    { name: "files that ship", before: networkBefore.files, after: networkAfter.files },
    { name: "arrows", before: networkBefore.arrows, after: networkAfter.arrows },
    ...HELD.map(([key, name]) => ({ name, before: shapeBefore[key], after: shapeAfter[key], held: true })),
    { name: "propagation cost", before: propagationCostOf(before), after: propagationCostOf(after), said: percent },
    { name: "mean way between two files, in arrows", before: networkBefore.meanPath, after: networkAfter.meanPath, said: hundredth },
    { name: "clustering", before: networkBefore.clustering, after: networkAfter.clustering, said: hundredth },
    { name: "small-world-ness", before: networkBefore.smallWorld, after: networkAfter.smallWorld, said: tenth },
  ];
  const rows = measures.map(({ name, before: was, after: now, held, said = String }) => {
    const moved = signed(now - was, said);
    const verdict = held && now !== was ? (now < was ? ", better" : ", worse") : "";
    return `| ${name} | ${said(was)} | ${said(now)} | ${moved}${verdict} |`;
  });
  return [`### The shape of the source, from \`${commitBefore.sha}\` to \`${commitAfter.sha}\``, "", "| measure | before | after | moved |", "| --- | ---: | ---: | --- |", ...rows, ""].join("\n");
}
