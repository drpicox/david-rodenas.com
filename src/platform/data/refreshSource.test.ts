import { describe, expect, it } from "vitest";
import { refreshSource } from "./refreshSource";
import type { YearlySource } from "./YearlySource";

type Held = { years: Record<string, number> };

const source: YearlySource<Held> = {
  name: "rain",
  directory: "public/data/rain",
  firstYear: 2023,
  files: ["a.json"],
  about: { measuredBy: "someone" },
  requestsFor: (year) => [`https://example.test/${year}`],
  withYear(files, year, answers) {
    const total = answers[0];
    if (typeof total !== "number") throw new Error("not a year");
    return { "a.json": { years: { ...files["a.json"]?.years, [year]: total } } };
  },
};

function disk(initial: Record<string, unknown> = {}) {
  const files = new Map(Object.entries(initial).map(([path, value]) => [path, JSON.stringify(value)]));
  const asked: string[] = [];
  return {
    files,
    asked,
    json: (path: string) => JSON.parse(files.get(path) ?? "null"),
    ports: (answer: (url: string) => unknown) => ({
      read: (path: string) => files.get(path) ?? null,
      write: (path: string, text: string) => void files.set(path, text),
      fetchJson: async (url: string) => {
        asked.push(url);
        return answer(url);
      },
      fetchText: async (url: string) => {
        asked.push(url);
        return String(answer(url));
      },
      today: new Date("2026-09-20T12:00:00Z"),
      log: () => {},
    }),
  };
}

describe("keeping a yearly source up to date", () => {
  it("asks for every finished year it does not hold, and keeps what it is told", async () => {
    const on = disk();
    const report = await refreshSource(source, on.ports((url) => Number(url.slice(-4)) - 2000));
    expect(report.added).toEqual([2023, 2024, 2025]);
    expect(on.json("public/data/rain/a.json")).toEqual({ years: { 2023: 23, 2024: 24, 2025: 25 } });
    expect(on.json("public/data/rain/index.json")).toMatchObject({ measuredBy: "someone", years: [2023, 2024, 2025] });
  });

  it("asks a source that is answered in words for words, telling it what day it is", async () => {
    const days: Date[] = [];
    const worded: YearlySource<Held> = {
      ...source,
      answers: "text",
      requestsFor: (year, today) => {
        days.push(today);
        return [`https://example.test/${year}`];
      },
      withYear: (files, year, answers) => ({ "a.json": { years: { ...files["a.json"]?.years, [year]: String(answers[0]).length } } }),
    };
    const on = disk({ "public/data/rain/index.json": { years: [2023, 2024] } });
    await refreshSource(worded, { ...on.ports(() => "words"), fetchJson: async () => Promise.reject(new Error("asked for JSON")) });
    expect(on.json("public/data/rain/a.json")).toEqual({ years: { 2025: 5 } });
    expect(days).toEqual([new Date("2026-09-20T12:00:00Z")]);
  });

  it("asks once for a file that holds every year, however many years it fills", async () => {
    const whole: YearlySource<Held> = {
      ...source,
      requestsFor: () => ["https://example.test/series"],
      withYear: (files, year, answers) => ({ "a.json": { years: { ...files["a.json"]?.years, [year]: (answers[0] as Record<number, number>)[year]! } } }),
    };
    const on = disk();
    const report = await refreshSource(whole, on.ports(() => ({ 2023: 23, 2024: 24, 2025: 25 })));
    expect(report.added).toEqual([2023, 2024, 2025]);
    expect(on.asked).toEqual(["https://example.test/series"]);
    expect(on.json("public/data/rain/a.json")).toEqual({ years: { 2023: 23, 2024: 24, 2025: 25 } });
  });

  it("asks for nothing while the year has not changed", async () => {
    const on = disk({ "public/data/rain/index.json": { years: [2023, 2024, 2025] } });
    const before = new Map(on.files);
    const report = await refreshSource(source, on.ports(() => 1));
    expect(on.asked).toEqual([]);
    expect(report.added).toEqual([]);
    expect(on.files).toEqual(before);
  });

  it("keeps the history when the portal fails, and does not fail the build over it", async () => {
    const on = disk({
      "public/data/rain/index.json": { years: [2023, 2024] },
      "public/data/rain/a.json": { years: { 2023: 23, 2024: 24 } },
    });
    const before = new Map(on.files);
    const report = await refreshSource(
      source,
      on.ports(() => {
        throw new Error("503");
      }),
    );
    expect(report).toMatchObject({ added: [], failed: { year: 2025 } });
    expect(on.files).toEqual(before);
  });

  it("treats an answer that is not a whole year as a failure", async () => {
    const on = disk({ "public/data/rain/index.json": { years: [2023, 2024] } });
    const report = await refreshSource(source, on.ports(() => "<html>maintenance</html>"));
    expect(report.failed?.year).toBe(2025);
    expect(on.json("public/data/rain/index.json").years).toEqual([2023, 2024]);
  });

  it("keeps the years it got before the one that failed, and stops asking", async () => {
    const on = disk();
    const report = await refreshSource(
      source,
      on.ports((url) => {
        if (url.endsWith("2024")) throw new Error("timeout");
        return 1;
      }),
    );
    expect(report.added).toEqual([2023]);
    expect(on.asked).toEqual(["https://example.test/2023", "https://example.test/2024"]);
    expect(on.json("public/data/rain/index.json").years).toEqual([2023]);
  });

  it("asks again for a year it holds when told to: the source corrects itself backwards", async () => {
    const on = disk({
      "public/data/rain/index.json": { years: [2023, 2024, 2025] },
      "public/data/rain/a.json": { years: { 2023: 23, 2024: 0, 2025: 25 } },
    });
    await refreshSource(source, on.ports(() => 24), [2024]);
    expect(on.asked).toEqual(["https://example.test/2024"]);
    expect(on.json("public/data/rain/a.json").years).toEqual({ 2023: 23, 2024: 24, 2025: 25 });
    expect(on.json("public/data/rain/index.json").years).toEqual([2023, 2024, 2025]);
  });
});
