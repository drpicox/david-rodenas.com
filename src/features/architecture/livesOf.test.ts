import { describe, expect, it } from "vitest";
import type { Change, History } from "./History";
import { livesOf } from "./livesOf";

const commit = (sha: string) => ({ sha, date: "2026-09-07", subject: sha });
const change = (parts: Partial<Change>): Change => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed: [], linked: [], unlinked: [], ...parts });

const history: History = {
  commits: [commit("one"), commit("two"), commit("three")],
  changes: [
    change({ added: [[0, "core/a.ts", 10, false], [1, "core/a.test.ts", 5, true], [2, "core/Shape.ts", 3, false, true]] }),
    change({ added: [[3, "core/b.ts", 4, false]], moved: [[0, "platform/a.ts"]], resized: [[0, 12]], changed: [0, 1] }),
    change({ removed: [3], changed: [0] }),
  ],
};

describe("the life of every file", () => {
  const lives = livesOf(history);
  const life = (id: number) => lives.find((one) => one.id === id);

  it("says when a file was written and every commit that changed it after", () => {
    expect(life(0)).toMatchObject({ born: 0, changed: [1, 2] });
    expect(life(3)).toMatchObject({ born: 1, changed: [] });
  });

  it("follows a file where it moves, and as long as it grows, to the last of it", () => {
    expect(life(0)).toMatchObject({ path: "platform/a.ts", lines: 12 });
  });

  it("says when a file went, and keeps it, as it stood then", () => {
    expect(life(3)).toMatchObject({ path: "core/b.ts", went: 2 });
    expect(life(0)?.went).toBeUndefined();
  });

  it("knows a test, and a file of nothing but types", () => {
    expect(lives.map(({ id, test, typesOnly }) => [id, test, typesOnly])).toEqual([
      [0, false, false],
      [1, true, false],
      [2, false, true],
      [3, false, false],
    ]);
  });

  it("knows a file of nothing but types as it is at the end, not as it was written", () => {
    const retyped: History = { commits: [commit("one"), commit("two")], changes: [change({ added: [[0, "a.ts", 10, false]] }), change({ changed: [0], retyped: [[0, true]] })] };
    expect(livesOf(retyped)[0]?.typesOnly).toBe(true);
  });
});
