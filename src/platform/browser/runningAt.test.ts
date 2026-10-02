import { afterEach, describe, expect, it, vi } from "vitest";
import { runningAt } from "./runningAt";

afterEach(() => vi.unstubAllGlobals());

const running = { year: 2026, through: "2026-09-28", refreshed: "2026-09-30", files: {} };
const answering = (ok: boolean, text: string) => vi.stubGlobal("fetch", async () => ({ ok, text: async () => text }));

describe("the year still running, asked of the server", () => {
  it("is what the server has", async () => {
    answering(true, JSON.stringify(running));
    expect(await runningAt("/data/rain/running.json")).toEqual(running);
  });

  it("is nothing when the server has none, answers with a page instead, or does not answer", async () => {
    answering(false, "Not found");
    expect(await runningAt("/data/rain/running.json")).toBeNull();
    answering(true, "<!doctype html><title>Home</title>");
    expect(await runningAt("/data/rain/running.json")).toBeNull();
    vi.stubGlobal("fetch", async () => {
      throw new Error("offline");
    });
    expect(await runningAt("/data/rain/running.json")).toBeNull();
  });
});
