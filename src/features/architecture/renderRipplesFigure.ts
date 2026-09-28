import { percent } from "./percent";
import type { Ripple } from "./ripplesOf";

interface Comparison {
  readonly how: "less often" | "more often" | "as often";
  /** The two shares, the type's first. */
  readonly shares: string;
}

/** How the arrows onto a type compared with those onto a value: by their shares, unless the two read the same. */
function compared(type: Ripple, value: Ripple): Comparison {
  const [ofType, ofValue] = [percent(type.carried, type.changes), percent(value.carried, value.changes)];
  const [a, b] = [type.carried / Math.max(1, type.changes), value.carried / Math.max(1, value.changes)];
  return { how: ofType === ofValue ? "as often" : a < b ? "less often" : "more often", shares: `${ofType} against ${ofValue}` };
}

/**
 * What each kind of arrow carries, as a figure: inside a box or across two,
 * onto a value or only onto a type, the share of the changes at the head of
 * an arrow that came with a change at its tail. Said in words whichever way
 * it came out, because the point is to find out, not to be proved right.
 */
export function renderRipplesFigure(ripples: readonly Ripple[]): string {
  const kind = (across: boolean, typeOnly: boolean): Ripple => ripples.find((one) => one.across === across && one.typeOnly === typeOnly) ?? { across, typeOnly, changes: 0, carried: 0 };
  const cell = (ripple: Ripple) => `<td>${percent(ripple.carried, ripple.changes)} · ${ripple.carried} of ${ripple.changes}</td>`;
  const row = (across: boolean, name: string) => `<tr><th scope="row">${name}</th>${cell(kind(across, false))}${cell(kind(across, true))}</tr>`;
  const across = compared(kind(true, true), kind(true, false));
  const inside = compared(kind(false, true), kind(false, false));
  return (
    `<figure class="changes-figure"><table class="ripples"><thead><tr><th></th><th>onto a value</th><th>onto only a type</th></tr></thead>` +
    `<tbody>${row(false, "inside a box")}${row(true, "across two boxes")}</tbody></table>` +
    `<figcaption>Across boxes, an arrow onto a type carried a change ${across.how} ${across.how === "as often" ? "as" : "than"} one onto a value: ${across.shares}. Inside a box, ${inside.how}: ${inside.shares}.</figcaption></figure>`
  );
}
