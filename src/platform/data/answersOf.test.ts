import { describe, expect, it } from "vitest";
import { answersOf } from "./answersOf";
import type { RefreshPorts } from "./RefreshPorts";
import type { YearlySource } from "./YearlySource";

const source: YearlySource<unknown> = {
  name: "rain",
  directory: "public/data/rain",
  firstYear: 2020,
  files: ["a.json"],
  about: {},
  requestsFor: (year) => [`https://example.test/${year}`],
  withYear: () => ({}),
};

/** A portal that answers every address with what it is told to, and remembers how it was asked: in JSON, or in words. */
function portal(answer: (url: string) => string) {
  const asked: string[] = [];
  const ports: RefreshPorts = {
    read: () => null,
    write: () => {},
    fetchJson: async (url) => {
      asked.push(`json ${url}`);
      return JSON.parse(answer(url)) as unknown;
    },
    fetchText: async (url) => {
      asked.push(`text ${url}`);
      return answer(url);
    },
    today: new Date("2026-09-20T12:00:00Z"),
    log: () => {},
  };
  return { ports, asked };
}

describe("what a source's portal answers for a year", () => {
  it("is what each of its addresses answers, in JSON unless the source is answered in words", async () => {
    const { ports, asked } = portal((url) => String(Number(url.slice(-4)) - 2000));
    expect(await answersOf(source, 2024, ports)).toEqual([24]);
    expect(await answersOf({ ...source, answers: "text" }, 2025, ports)).toEqual(["25"]);
    expect(asked).toEqual(["json https://example.test/2024", "text https://example.test/2025"]);
  });

  it("asks for an address once, however many years it holds: a series published whole is one file", async () => {
    const whole: YearlySource<unknown> = { ...source, answers: "text", requestsFor: () => ["https://example.test/series.txt"] };
    const { ports, asked } = portal(() => "2020 2021 2022");
    const known = new Map<string, Promise<unknown>>();
    for (const year of [2020, 2021, 2022]) expect(await answersOf(whole, year, ports, known)).toEqual(["2020 2021 2022"]);
    expect(asked).toEqual(["text https://example.test/series.txt"]);
  });

  it("follows a page to the file it links to, for a portal that names the file anew every year", async () => {
    const linked: YearlySource<unknown> = {
      ...source,
      requestsFor: () => ["https://example.test/the-series/"],
      follow: (page) => /href="([^"]+\.json)"/.exec(page)?.[1] ?? "",
    };
    const { ports, asked } = portal((url) => (url.endsWith("/") ? '<p>Download <a href="https://example.test/uploads/2026/series_2025.json">it</a></p>' : "[25]"));
    expect(await answersOf(linked, 2025, ports)).toEqual([[25]]);
    expect(asked).toEqual(["text https://example.test/the-series/", "json https://example.test/uploads/2026/series_2025.json"]);
  });
});
