import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { boxOf } from "./boxOf";
import { type Coupled, couplingOf, type Coupling } from "./couplingOf";
import { plural } from "./plural";
import type { Snapshot } from "./Snapshot";

const W = 720;
/** Room each side for the boxes on the other end of the arrows. */
const SIDE = 220;
const BOX = { x: 300, width: 120 };
const TOP = 34;
const ROW = 22;
const CELL = 13;
/** Boxes named each side, the rest counted. */
const SHOWN = 8;

/** The box to explain when none is named: one that is needed by at least three files and needs through at least two, the nearest to half way, where both couplings count. */
function exampleOf(snapshot: Snapshot): string {
  const boxes = [...new Set(snapshot.modules.filter((module) => !module.test).map((module) => boxOf(module.path)))].map((box) => couplingOf(snapshot, box));
  const both = boxes.filter(({ ca, ce }) => ca >= 3 && ce >= 2);
  const pool = both.length > 0 ? both : boxes;
  return [...pool].sort((a, b) => Math.abs((a.instability ?? 1) - 0.5) - Math.abs((b.instability ?? 1) - 0.5) || b.files.length - a.files.length || a.box.localeCompare(b.box))[0]?.box ?? "";
}

/** One side's boxes, as many as are shown, and the rest counted in a last line. */
function shownOf(coupled: readonly Coupled[]): string[] {
  const shown = coupled.slice(0, SHOWN).map(({ box, files }) => `${box} · ${plural(files, "file")}`);
  const rest = coupled.slice(SHOWN);
  if (rest.length > 0) shown.push(`and ${plural(rest.length, "box", "boxes")} more · ${plural(rest.reduce((sum, one) => sum + one.files, 0), "file")}`);
  return shown;
}

/** How to read an instability, in words. */
const meaningOf = (instability: number | null) =>
  instability === null
    ? "Neither needed nor needing, it has no instability to speak of."
    : instability < 0.3
      ? "Stable: much stands on it, and it stands on little — hard to change, and seldom made to."
      : instability > 0.7
        ? "Unstable: it stands on much, and little stands on it — often made to change, and free to."
        : "Between the two: it is needed, and it needs.";

function drawn(coupling: Coupling): string {
  const [left, right] = [shownOf(coupling.neededBy), shownOf(coupling.needs)];
  const columns = Math.max(1, Math.min(8, Math.ceil(Math.sqrt(coupling.files.length * 1.6))));
  const boxHeight = Math.max(ROW * 2, 24 + Math.ceil(coupling.files.length / columns) * CELL + 8);
  const height = TOP + Math.max(left.length * ROW, right.length * ROW, boxHeight) + 12;
  const needing = new Set(coupling.needing);
  const along = (count: number, index: number) => TOP + (boxHeight * (index + 1)) / (count + 1);
  const rowY = (index: number) => TOP + 12 + index * ROW;
  const curve = (x1: number, y1: number, x2: number, y2: number) => `M${fixed(x1)} ${fixed(y1)} C${fixed((x1 + x2) / 2)} ${fixed(y1)} ${fixed((x1 + x2) / 2)} ${fixed(y2)} ${fixed(x2)} ${fixed(y2)}`;
  const incoming = left
    .map((words, index) => {
      const y = rowY(index);
      return `<text class="coupled in" x="${SIDE - 8}" y="${fixed(y + 4)}" text-anchor="end">${escapeHtml(words)}</text><path class="arrow in" d="${curve(SIDE, y, BOX.x - 3, along(left.length, index))}" marker-end="url(#coupled-in)"/>`;
    })
    .join("");
  const outgoing = right
    .map((words, index) => {
      const y = rowY(index);
      return `<path class="arrow out" d="${curve(BOX.x + BOX.width, along(right.length, index), W - SIDE - 3, y)}" marker-end="url(#coupled-out)"/><text class="coupled out" x="${W - SIDE + 8}" y="${fixed(y + 4)}">${escapeHtml(words)}</text>`;
    })
    .join("");
  const left0 = BOX.x + (BOX.width - columns * CELL) / 2;
  const files = coupling.files
    .map((id, index) => `<circle class="file${needing.has(id) ? " needing" : ""}" cx="${fixed(left0 + ((index % columns) + 0.5) * CELL)}" cy="${fixed(TOP + 22 + Math.floor(index / columns) * CELL)}" r="4"/>`)
    .join("");
  const marker = (name: string) => `<marker id="coupled-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="head ${name}" d="M0 0 L10 5 L0 10 z"/></marker>`;
  return (
    `<svg class="coupling" data-box="${escapeHtml(coupling.box)}" viewBox="0 0 ${W} ${fixed(height)}" role="img" aria-label="${escapeHtml(`${coupling.box}: ${coupling.ca} files elsewhere need it, ${coupling.ce} of its files need elsewhere`)}">` +
    `<defs>${marker("in")}${marker("out")}</defs>` +
    `<text class="side in" x="${SIDE - 8}" y="14" text-anchor="end">Ca = ${coupling.ca}: files elsewhere that need it</text>` +
    `<text class="side out" x="${W - SIDE + 8}" y="14">Ce = ${coupling.ce}: its files that need elsewhere</text>` +
    `<rect class="box" x="${BOX.x}" y="${TOP}" width="${BOX.width}" height="${fixed(boxHeight)}" rx="5"/>` +
    `<text class="box-name" x="${BOX.x + BOX.width / 2}" y="${TOP + 11}" text-anchor="middle">${escapeHtml(coupling.box.split("/").pop() ?? coupling.box)}</text>` +
    `${files}${incoming}${outgoing}</svg>`
  );
}

/**
 * A box's two couplings, drawn so that Robert C. Martin's instability can be
 * worked out by eye: on one side, the boxes whose files need something in it,
 * their arrows coming in — its Ca; on the other, the boxes its own files need,
 * the arrows going out — and among its files, the ones that need (its Ce,
 * which counts those files, not the boxes they reach). Under it, the sum.
 * Coloured as the picture of the source colours a file's arrows when it is
 * pointed at: orange for what needs it, blue for what it needs.
 */
export function renderCouplingFigure(snapshot: Snapshot, box = exampleOf(snapshot)): string {
  const coupling = couplingOf(snapshot, box);
  const { ca, ce, instability } = coupling;
  const sum = instability === null ? "I has nothing to divide" : `I = Ce / (Ca + Ce) = ${ce} / (${ca} + ${ce}) = ${Math.round(instability * 100) / 100}`;
  return (
    `<figure class="changes-figure coupling-figure">${drawn(coupling)}` +
    `<figcaption><strong>${escapeHtml(box)}</strong>: Ca = ${ca}, the files elsewhere that need something in it; Ce = ${ce}, its own files that need something elsewhere. ${sum}. ${meaningOf(instability)}</figcaption></figure>`
  );
}
