import type { NpmDownloads } from "./NpmDownloads";
import { packageNotes } from "./packageNotes";

const W = 160;
const H = 28;
const count = (value: number) => value.toLocaleString("en-US");

/** A row's years as bars on the row's own scale: the shape of its life, not its size — the total says the size. */
function spark(years: readonly string[], byYear: (year: string) => number): string {
  const top = Math.max(1, ...years.map(byYear));
  const slot = W / years.length;
  const bars = years
    .map((year, index) => {
      const height = (byYear(year) / top) * (H - 2);
      return `<rect x="${(index * slot + 1).toFixed(1)}" y="${(H - height).toFixed(1)}" width="${(slot - 2).toFixed(1)}" height="${height.toFixed(1)}"><title>${year}: ${count(byYear(year))}</title></rect>`;
    })
    .join("");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Downloads a year, ${years[0]} to ${years[years.length - 1]}">${bars}</svg>`;
}

/**
 * The packages that earned a line, most downloaded first, then every other
 * package as one row. Plain markup, the same from the build and the browser.
 */
export function renderPackages(downloads: NpmDownloads): string {
  const years = Object.keys(downloads.years).sort();
  const of = (name: string) => (year: string) => downloads.years[year]?.[name] ?? 0;
  const totalOf = (byYear: (year: string) => number) => years.reduce((sum, year) => sum + byYear(year), 0);

  const named = Object.keys(packageNotes).sort((a, b) => totalOf(of(b)) - totalOf(of(a)));
  const others = [...new Set(years.flatMap((year) => Object.keys(downloads.years[year] ?? {})))].filter((name) => !(name in packageNotes));
  const ofOthers = (year: string) => others.reduce((sum, name) => sum + of(name)(year), 0);
  const everything = (year: string) => Object.values(downloads.years[year] ?? {}).reduce((a, b) => a + b, 0);

  const rows = named
    .filter((name) => totalOf(of(name)) > 0)
    .map(
      (name) =>
        `<tr><th scope="row"><a href="https://www.npmjs.com/package/${name}"><code>${name}</code></a><span>${packageNotes[name]}</span></th>` +
        `<td>${spark(years, of(name))}</td><td>${count(totalOf(of(name)))}</td></tr>`,
    )
    .join("");
  const rest = others.length ? `<tr><th scope="row">the other ${others.length}<span>mostly AngularJS and Redux helpers written for one project each</span></th><td>${spark(years, ofOthers)}</td><td>${count(totalOf(ofOthers))}</td></tr>` : "";

  return (
    `<figure class="packages"><table class="packages"><thead><tr><th>package</th><th>${years[0]} to ${years[years.length - 1]}, a bar a year</th><th>downloads</th></tr></thead>` +
    `<tbody>${rows}${rest}</tbody><tfoot><tr><th scope="row">all of them</th><td>${spark(years, everything)}</td><td>${count(totalOf(everything))}</td></tr></tfoot></table></figure>`
  );
}
