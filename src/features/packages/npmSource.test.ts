import { describe, expect, it } from "vitest";
import { npmSource } from "./npmSource";

const answer = (downloads: Record<string, number | null>) =>
  Object.fromEntries(Object.entries(downloads).map(([name, count]) => [name, count === null ? null : { downloads: count, package: name, start: "2024-01-01", end: "2024-12-31" }]));

describe("a year of npm downloads, from the registry to the file", () => {
  it("asks the registry once for the whole year and every package", () => {
    const [url, ...rest] = npmSource.requestsFor(2024);
    expect(rest).toEqual([]);
    expect(url).toContain("https://api.npmjs.org/downloads/point/2024-01-01:2024-12-31/");
    expect(url).toContain("string-cache-map,async-barrier");
  });

  it("keeps what each package was downloaded, and leaves out the ones nobody downloaded or that did not exist yet", () => {
    const files = npmSource.withYear({}, 2024, [answer({ "string-cache-map": 12000, "async-barrier": 900, "gherkin-genie": 0, "drpx-seo": null })]);
    expect(files["downloads.json"]).toEqual({ years: { 2024: { "string-cache-map": 12000, "async-barrier": 900 } } });
  });

  it("adds the year to the ones already held", () => {
    const first = npmSource.withYear({}, 2023, [answer({ "async-barrier": 800 })]);
    const second = npmSource.withYear(first, 2024, [answer({ "async-barrier": 900 })]);
    expect(Object.keys(second["downloads.json"]?.years ?? {})).toEqual(["2023", "2024"]);
  });

  it("refuses an answer that is not downloads: an error, or a year in which nothing at all was downloaded", () => {
    expect(() => npmSource.withYear({}, 2024, [{ error: "not found" }])).toThrow(/downloads/);
    expect(() => npmSource.withYear({}, 2024, [answer({ "async-barrier": 0 })])).toThrow(/downloads/);
    expect(() => npmSource.withYear({}, 2024, ["<html>"])).toThrow(/downloads/);
  });
});
