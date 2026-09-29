import { fixed } from "../../platform/charts/fixed";
import { plural } from "./plural";
import type { Shape } from "./shapeOf";

const W = 240;
const H = 36;
const PAD = 4;
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

/** What the ratchet held at a commit: nothing before it began. */
type Held = Readonly<Record<string, number>> | null;

/** Each measure the ratchet holds: its name, what it counts, and how it is said in a sentence. */
const MEASURES: readonly { readonly key: keyof Shape; readonly name: string; readonly counts: string; readonly said: (value: number) => string }[] = [
  {
    key: "againstStability",
    name: "arrows against stability",
    counts: "box arrows from a box to one less stable than itself, by Robert C. Martin's measure; the composition's aside, which has to point at every feature",
    said: (value) => `${value} box ${value === 1 ? "arrow" : "arrows"} against stability`,
  },
  { key: "deepestCore", name: "deepest core", counts: "how deep the knot of files goes: what is left when every file with fewer links than that is taken away, again and again", said: (value) => `a core ${value} deep` },
  { key: "tallestStack", name: "tallest stack", counts: "the longest chain of what needs what, in arrows", said: (value) => `a stack ${value} ${value === 1 ? "arrow" : "arrows"} tall` },
  { key: "untested", name: "untested files", counts: "files that ship with something in them to run that no test imports", said: (value) => `${value} ${value === 1 ? "file" : "files"} with something to run that no test imports` },
];

const listOf = (items: readonly string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? ""));
const allSaid = (held: Readonly<Record<string, number>>) => listOf(MEASURES.map(({ key, said }) => said(held[key] ?? 0)));
const when = (date: string | undefined) => day.format(new Date(date ?? ""));

/**
 * One measure over the history: what the ratchet held, as a band that steps
 * where it was changed, from where it began; what the source measured, as a
 * line in it, solid to the commit shown and faint after; and a dashed line
 * where the ratchet began.
 */
function lineOf(measured: readonly number[], held: readonly (number | null)[], at: number, began: number | null, name: string): string {
  const most = Math.max(1, ...measured, ...held.filter((value): value is number => value !== null));
  const x = (index: number) => PAD + (index / Math.max(1, measured.length - 1)) * (W - PAD * 2);
  const y = (value: number) => H - PAD - (value / most) * (H - PAD * 2);
  const points = (from: number, to: number) => measured.slice(from, to + 1).map((value, index) => `${fixed(x(from + index))},${fixed(y(value))}`).join(" ");
  let band = "";
  if (began !== null) {
    band = `M${fixed(x(began))} ${fixed(y(held[began] ?? 0))}`;
    for (let index = began + 1; index < held.length; index += 1) band += ` H${fixed(x(index))} V${fixed(y(held[index] ?? 0))}`;
    // A ratchet as old as the last commit is a point, and a point has to be drawn to be seen.
    band += " h0.1";
  }
  return (
    `<svg class="ratchet-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="${name}: measured at every commit, and held by the ratchet from where it began">` +
    (began === null ? "" : `<line class="began" x1="${fixed(x(began))}" x2="${fixed(x(began))}" y1="0" y2="${H}"/><path class="held-band" d="${band}"/>`) +
    `<polyline class="after" points="${points(at, measured.length - 1)}"/><polyline class="measured" points="${points(0, at)}"/>` +
    `<circle class="now" cx="${fixed(x(at))}" cy="${fixed(y(measured[at] ?? 0))}" r="2.5"/></svg>`
  );
}

/** What the ratchet holds at the commit shown, and what the source measures beside it; or, before it began, when it did. */
function nowSaid(shown: Shape, held: Held, began: number | null, dates: readonly string[]): string {
  if (!held) return began === null ? "" : `The ratchet began on ${when(dates[began])}, after this commit.`;
  const differing = MEASURES.filter(({ key }) => shown[key] !== (held[key] ?? shown[key]));
  if (differing.length === 0) return `At this commit, the ratchet holds ${allSaid(held)}, and the source measures the same.`;
  const measured = differing.map(({ key, said }) => `${said(shown[key])}, ${shown[key] > (held[key] ?? 0) ? "above" : "below"} what it holds`);
  return `At this commit, the ratchet holds ${allSaid(held)}; the source measures ${listOf(measured)}.`;
}

/** Whether, at any commit from the ratchet's first to the one shown, the source measured more than it held — which the test is there to stop. */
function keptSaid(shapes: readonly Shape[], held: readonly Held[], at: number, began: number): string {
  const over = shapes.slice(began, at + 1).flatMap((shape, index) => {
    const holding = held[began + index];
    const above = MEASURES.filter(({ key }) => holding && shape[key] > (holding[key] ?? shape[key]));
    return above.length > 0 ? [above] : [];
  });
  if (over.length === 0) return "At no commit since it began has the source measured more than the ratchet held.";
  const names = MEASURES.filter((measure) => over.some((above) => above.includes(measure))).map(({ name }) => `the ${name}`);
  return `At ${plural(over.length, "commit")} since it began, the source measured more than the ratchet held: ${listOf(names)}.`;
}

/** How the ratchet went, to the commit shown: when it began and what it held, and every change to it since. */
function logOf(held: readonly Held[], at: number, dates: readonly string[]): string {
  const entries: string[] = [];
  held.slice(0, at + 1).forEach((now, index) => {
    const before = held[index - 1] ?? null;
    if (!now || JSON.stringify(now) === JSON.stringify(before)) return;
    if (!before) {
      entries.push(`${when(dates[index])}: began, holding ${allSaid(now)}`);
      return;
    }
    const moved = MEASURES.filter(({ key }) => now[key] !== before[key]);
    const down = moved.filter(({ key }) => (now[key] ?? 0) < (before[key] ?? 0)).length;
    const how = down === moved.length ? "tightened" : down === 0 ? "loosened" : "changed";
    entries.push(`${when(dates[index])}: ${how}, ${listOf(moved.map(({ key, name }) => `the ${name} from ${before[key]} to ${now[key]}`))}`);
  });
  return entries.length > 0 ? `<p class="ratchet-log-title">How the ratchet went</p><ol class="ratchet-log">${entries.map((entry) => `<li>${entry}</li>`).join("")}</ol>` : "";
}

/**
 * The ratchet and the source, side by side: for each measure the ratchet
 * holds, its name and what it counts; how it went at every commit of the
 * history, measured as the ratchet measures it now, with what the ratchet held
 * as a band from the commit that brought it in; and, at the commit shown, what
 * the ratchet holds and what the source measures. Under them, how the ratchet
 * went — when it began and every change to it since — and whether the source
 * ever measured more than it held.
 */
export function renderRatchetFigure(shapes: readonly Shape[], at: number, held: readonly Held[], dates: readonly string[]): string {
  const shown = shapes[at] ?? shapes.at(-1);
  if (!shown) return "";
  const firstHeld = held.findIndex((one) => one !== null);
  const began = firstHeld < 0 ? null : firstHeld;
  const rows = MEASURES.map(({ key, name, counts }) => {
    const heldValues = held.map((one) => (one ? (one[key] ?? null) : null));
    return (
      `<tr><td><strong>${name}</strong><br><span class="ratchet-counts">${counts}</span></td>` +
      `<td>${lineOf(shapes.map((shape) => shape[key]), heldValues, at, began, name)}</td><td class="held">${heldValues[at] ?? "–"}</td><td class="now">${shown[key]}</td></tr>`
    );
  }).join("");
  const said = [nowSaid(shown, held[at] ?? null, began, dates), began !== null && at >= began ? keptSaid(shapes, held, at, began) : ""].filter(Boolean).join(" ");
  const key = (kind: string, words: string) => `<span class="key ${kind}"></span>${words}`;
  return (
    `<figure class="changes-figure"><table class="ratchet"><thead><tr><th>what the ratchet holds</th><th>over the history</th><th>held</th><th>measured</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<p class="changes-legend">${key("ratchet-measured", "measured at every commit")}${key("ratchet-held", "held by the ratchet")}</p>` +
    `${logOf(held, at, dates)}${said ? `<figcaption>${said}</figcaption>` : ""}</figure>`
  );
}
