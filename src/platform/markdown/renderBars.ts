import { escapeHtml } from "./escapeHtml";
import { renderInline } from "./renderInline";

/**
 * A handful of numbers as bars, written where the prose is:
 *
 *     times faster than one thread        what the numbers are (optional)
 *     = 1 :: one thread                   a value every bar is held against (optional)
 *     where it started :: 0.77
 *     a lock of its own :: 0.36 !         the line that is the point
 *     a lock for each line :: 4.39 | 4.4, once tuned    the number, said its own way
 *
 * It is a table with the numbers in it, drawn at build time like the diagrams:
 * a chart that needs a script is a chart a search engine and half the readers
 * never see. Bars start at zero, always — a bar is a length, and a length
 * that does not start at zero is a lie about the ratio.
 */
export function renderBars(source: string): string {
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  const caption = lines.find((line) => !line.includes(" :: "));
  const written = lines.filter((line) => line.includes(" :: ")).map((line) => {
    const at = line.indexOf(" :: ");
    return { left: line.slice(0, at).trim(), right: line.slice(at + 4).trim() };
  });
  // `= 1 :: one thread`: the value is on the left, and what it is on the right.
  const rules = written.filter(({ left }) => left.startsWith("=")).map(({ left, right }) => ({ value: Number(left.slice(1)), name: right }));
  const bars = written
    .filter(({ left }) => !left.startsWith("="))
    .map(({ left, right }) => {
      const [figure = "", shown] = right.split("|").map((part) => part.trim());
      const value = Number(figure.replace(/!$/, "").trim());
      return { label: left, value, shown: shown ?? String(value), marked: figure.endsWith("!") };
    });
  const top = Math.max(0, ...bars.map(({ value }) => value), ...rules.map(({ value }) => value)) || 1;
  const share = (value: number) => (Math.max(0, value) / top).toFixed(3);

  const rule = rules[0];
  const rows = bars
    .map(
      ({ label, value, shown, marked }) =>
        `<tr${marked ? ' class="marked"' : ""}><th scope="row">${renderInline(label)}</th>` +
        `<td><span class="bar" style="--p:${share(value)}"></span><span class="value">${escapeHtml(shown)}</span></td></tr>`,
    )
    .join("");
  const held = rule ? ` style="--rule:${share(rule.value)}"` : "";
  const legend = rule ? ` The line is ${escapeHtml(rule.name)}, at ${rule.value}.` : "";
  const figcaption = caption || rule ? `<figcaption>${caption ? renderInline(caption) + "." : ""}${legend}</figcaption>` : "";
  return `<figure class="bars"><table${held}${rule ? ' class="ruled"' : ""}><tbody>${rows}</tbody></table>${figcaption}</figure>`;
}
