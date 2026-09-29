import { describe, expect, it } from "vitest";
import type { History } from "./History";
import { ratchetHeldOf } from "./ratchetHeldOf";

const history = (ratchets?: History["ratchets"]): History => ({ commits: [], changes: Array.from({ length: 5 }, () => ({ added: [], removed: [], moved: [], resized: [], retyped: [], changed: [], linked: [], unlinked: [] })), ...(ratchets ? { ratchets } : {}) });

describe("what the ratchet held at every commit", () => {
  it("is nothing before it began, and from each commit that changed it, what it held from then", () => {
    expect(ratchetHeldOf(history([[1, { untested: 9 }], [3, { untested: 7 }]]))).toEqual([null, { untested: 9 }, { untested: 9 }, { untested: 7 }, { untested: 7 }]);
  });

  it("is nothing at all in a history before any ratchet", () => {
    expect(ratchetHeldOf(history())).toEqual([null, null, null, null, null]);
  });
});
