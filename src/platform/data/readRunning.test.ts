import { describe, expect, it } from "vitest";
import { readRunning } from "./readRunning";

describe("reading the year still running, where it may not be", () => {
  it("is what the file says", () => {
    const running = { year: 2026, through: "2026-09-28", refreshed: "2026-09-30", files: {} };
    expect(readRunning(() => JSON.stringify(running), "/data/rain/running.json")).toEqual(running);
  });

  it("is nothing when there is no file, or nothing readable in it: the finished years stand without it", () => {
    expect(
      readRunning(() => {
        throw new Error("ENOENT");
      }, "/data/rain/running.json"),
    ).toBeNull();
    expect(readRunning(() => "<!doctype html>", "/data/rain/running.json")).toBeNull();
  });
});
