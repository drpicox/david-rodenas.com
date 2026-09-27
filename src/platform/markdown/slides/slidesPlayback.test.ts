import { describe, expect, it } from "vitest";
import { slidesPlayback } from "./slidesPlayback";

describe("slides, played as keystrokes and pauses", () => {
  const shots = slidesPlayback([
    { text: "ab", status: { kind: "red", text: "Expected: 2. Received: 1." } },
    { text: "ac", status: { kind: "green", text: "All tests pass." } },
    { text: "ac!" },
  ]);

  it("types the first frame from nothing, then says how it went, long enough to be read", () => {
    expect(shots.slice(0, 2).map((shot) => shot.text)).toEqual(["a", "ab"]);
    const said = shots.find((shot) => shot.status?.kind === "red");
    expect(said?.text).toBe("ab");
    expect(said?.hold).toBeGreaterThanOrEqual(1500);
  });

  it("goes from one frame to the next by rubbing out and typing only what changed, saying nothing meanwhile", () => {
    const between = shots.slice(shots.findIndex((shot) => shot.status?.kind === "red") + 1, shots.findIndex((shot) => shot.status?.kind === "green"));
    expect(between.map((shot) => shot.text)).toContain("a");
    expect(between.every((shot) => shot.status === undefined)).toBe(true);
    expect(shots.at(-1)?.text).toBe("ac!");
  });

  it("types faster than a reader reads, and rubs out faster than it types", () => {
    const typed = shots[0]?.hold ?? 0;
    const rubbed = shots.find((shot, index) => index > 0 && shot.text.length < (shots[index - 1]?.text.length ?? 0))?.hold ?? 0;
    expect(typed).toBeLessThan(100);
    expect(rubbed).toBeLessThan(typed);
  });
});
