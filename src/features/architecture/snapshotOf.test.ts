import { describe, expect, it } from "vitest";
import { snapshotOf } from "./snapshotOf";

describe("the source the compiler reads, as a snapshot of the history", () => {
  it("numbers the files and joins the arrows by number, as a commit of the history has them", () => {
    const snapshot = snapshotOf({
      modules: [
        { path: "a.ts", lines: 3, test: false, typesOnly: false },
        { path: "b.ts", lines: 5, test: false, typesOnly: true },
      ],
      dependencies: [
        { from: "a.ts", to: "b.ts", typeOnly: true },
        { from: "a.ts", to: "elsewhere.ts", typeOnly: false },
      ],
    });
    expect(snapshot.modules).toEqual([
      { id: 0, path: "a.ts", lines: 3, test: false, typesOnly: false },
      { id: 1, path: "b.ts", lines: 5, test: false, typesOnly: true },
    ]);
    // An arrow to a file the graph does not hold leads nowhere the measures can follow.
    expect(snapshot.dependencies).toEqual([{ from: 0, to: 1, typeOnly: true }]);
  });
});
