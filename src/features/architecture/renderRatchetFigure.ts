import { fixed } from "../../platform/charts/fixed";
import type { Shape } from "./shapeOf";

const W = 240;
const H = 36;
const PAD = 3;
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

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

/** One measure over the history: solid to the commit shown, faint after it, and a dashed line where the ratchet began. */
function lineOf(values: readonly number[], at: number, began: number | null, name: string): string {
  const most = Math.max(1, ...values);
  const x = (index: number) => PAD + (index / Math.max(1, values.length - 1)) * (W - PAD * 2);
  const y = (value: number) => H - PAD - (value / most) * (H - PAD * 2);
  const points = (from: number, to: number) => values.slice(from, to + 1).map((value, index) => `${fixed(x(from + index))},${fixed(y(value))}`).join(" ");
  const shown = values[at] ?? 0;
  return (
    `<svg class="ratchet-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} at every commit, ${shown} at the one shown">` +
    (began === null ? "" : `<line class="began" x1="${fixed(x(began))}" x2="${fixed(x(began))}" y1="0" y2="${H}"/>`) +
    `<polyline class="after" points="${points(at, values.length - 1)}"/><polyline class="held" points="${points(0, at)}"/>` +
    `<circle class="now" cx="${fixed(x(at))}" cy="${fixed(y(shown))}" r="2.5"/></svg>`
  );
}

/** Since when the ratchet holds the measures, and whether any went up from one commit to the next after it began — which the test is there to stop. */
function sinceSaid(shapes: readonly Shape[], at: number, began: { readonly at: number; readonly date: string }): string {
  const when = day.format(new Date(began.date));
  if (at < began.at) return `The ratchet began on ${when}, after this commit.`;
  const held = shapes.slice(began.at, at + 1);
  const rose = MEASURES.filter(({ key }) => held.some((shape, index) => index > 0 && shape[key] > (held[index - 1]?.[key] ?? shape[key])));
  return `The ratchet holds them from ${when}: since then, ${rose.length === 0 ? "none has gone up" : `${listOf(rose.map(({ name }) => `the ${name}`))} went up`}.`;
}

/**
 * The measures the ratchet holds, over the whole history: each one's name and
 * what it counts, how it went commit by commit — measured now, as the ratchet
 * measures it, over every commit that came before it too — and where it stands
 * at the commit shown. A dashed line marks where the ratchet began; from
 * there, the test lets none of them go up, and the caption says whether any
 * did.
 */
export function renderRatchetFigure(shapes: readonly Shape[], at: number, began: { readonly at: number; readonly date: string } | null): string {
  const shown = shapes[at] ?? shapes.at(-1);
  if (!shown) return "";
  const rows = MEASURES.map(({ key, name, counts }) => {
    const values = shapes.map((shape) => shape[key]);
    return `<tr><td><strong>${name}</strong><br><span class="ratchet-counts">${counts}</span></td><td>${lineOf(values, at, began?.at ?? null, name)}</td><td class="now">${shown[key]}</td></tr>`;
  }).join("");
  const said = `At this commit: ${listOf(MEASURES.map(({ key, said: say }) => say(shown[key])))}.${began ? ` ${sinceSaid(shapes, at, began)}` : ""}`;
  return (
    `<figure class="changes-figure"><table class="ratchet"><thead><tr><th>what the ratchet holds</th><th>over the history</th><th>now</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<figcaption>${said}</figcaption></figure>`
  );
}
