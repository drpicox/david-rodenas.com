import { describe, expect, it } from "vitest";
import { refreshRunning } from "./refreshRunning";
import type { YearlySource } from "./YearlySource";

type Held = { years: Record<string, number> };

const source: YearlySource<Held> = {
  name: "rain",
  directory: "public/data/rain",
  firstYear: 2023,
  files: ["a.json"],
  about: {},
  requestsFor: (year) => [`https://example.test/${year}`],
  withYear: () => {
    throw new Error("not asked for a whole year here");
  },
  soFar(year, answers) {
    const days = answers[0];
    if (!Array.isArray(days) || days.length === 0) throw new Error("no days yet");
    return { files: { "a.json": { years: { [year]: days.length } } }, through: `${year}-09-${String(days.length).padStart(2, "0")}` };
  },
};

function disk(initial: Record<string, unknown> = {}, today = "2026-09-20T12:00:00Z") {
  const files = new Map(Object.entries(initial).map(([path, value]) => [path, JSON.stringify(value)]));
  const asked: string[] = [];
  const logged: string[] = [];
  return {
    files,
    asked,
    logged,
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
      today: new Date(today),
      log: (line: string) => void logged.push(line),
    }),
  };
}

const HELD = { "public/data/rain/index.json": { years: [2023, 2024, 2025] } };

describe("keeping the year still running", () => {
  it("asks for it and keeps it apart from the finished years, with the last day it reaches and the day it was asked", async () => {
    const on = disk(HELD);
    await refreshRunning(source, on.ports(() => [1, 2, 3]));
    expect(on.asked).toEqual(["https://example.test/2026"]);
    expect(on.json("public/data/rain/running.json")).toEqual({ year: 2026, through: "2026-09-03", refreshed: "2026-09-20", files: { "a.json": { years: { 2026: 3 } } } });
    expect(on.files.has("public/data/rain/a.json")).toBe(false);
  });

  it("asks a source that is answered in words for words, telling it what day it is, for a year whose days it cannot know", async () => {
    const days: Date[] = [];
    const worded: YearlySource<Held> = {
      ...source,
      answers: "text",
      requestsFor: (year, today) => {
        days.push(today);
        return [`https://example.test/${year}`];
      },
      soFar: (year, answers) => ({ files: { "a.json": { years: { [year]: String(answers[0]).length } } }, through: `${year}-09-18` }),
    };
    const on = disk(HELD);
    await refreshRunning(worded, { ...on.ports(() => "so far"), fetchJson: async () => Promise.reject(new Error("asked for JSON")) });
    expect(on.json("public/data/rain/running.json")).toMatchObject({ files: { "a.json": { years: { 2026: 6 } } } });
    expect(days).toEqual([new Date("2026-09-20T12:00:00Z")]);
  });

  it("asks once a day at most", async () => {
    const on = disk({ ...HELD, "public/data/rain/running.json": { year: 2026, through: "2026-09-18", refreshed: "2026-09-20", files: {} } });
    await refreshRunning(source, on.ports(() => [1]));
    expect(on.asked).toEqual([]);
  });

  it("asks again on another day", async () => {
    const on = disk({ ...HELD, "public/data/rain/running.json": { year: 2026, through: "2026-09-18", refreshed: "2026-09-19", files: {} } });
    await refreshRunning(source, on.ports(() => [1, 2]));
    expect(on.json("public/data/rain/running.json")).toMatchObject({ through: "2026-09-02", refreshed: "2026-09-20" });
  });

  it("keeps what it held when the portal fails, and does not fail the build over it", async () => {
    const held = { year: 2026, through: "2026-09-18", refreshed: "2026-09-19", files: { "a.json": { years: { 2026: 18 } } } };
    const on = disk({ ...HELD, "public/data/rain/running.json": held });
    await expect(refreshRunning(source, on.ports(() => []))).resolves.toBeUndefined();
    expect(on.json("public/data/rain/running.json")).toEqual(held);
    expect(on.logged).toEqual(["rain: 2026 so far failed (no days yet); keeping what is held"]);
  });

  it("asks nothing of a source that has nothing to show of a year in progress", async () => {
    const on = disk(HELD);
    await refreshRunning({ ...source, soFar: undefined }, on.ports(() => [1]));
    expect(on.asked).toEqual([]);
  });
});
