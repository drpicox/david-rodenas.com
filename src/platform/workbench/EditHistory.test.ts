import { describe, expect, it } from "vitest";
import { EditHistory } from "./EditHistory";

describe("every state a blueprint was in", () => {
  it("steps back and forward through the edits", () => {
    const history = new EditHistory("a");
    history.push("b");
    history.push("c");
    expect(history.undo()).toBe("b");
    expect(history.undo()).toBe("a");
    expect(history.canUndo).toBe(false);
    expect(history.redo()).toBe("b");
    expect(history.now).toBe("b");
  });

  it("forgets what was undone once something new is done", () => {
    const history = new EditHistory("a");
    history.push("b");
    history.undo();
    history.push("c");
    expect(history.canRedo).toBe(false);
    expect(history.undo()).toBe("a");
  });

  it("keeps quick edits of one thing as one step, and slow ones, or of other things, apart", () => {
    const history = new EditHistory(0);
    history.push(1, "dial", 1000);
    history.push(2, "dial", 1300);
    history.push(3, "dial", 1600);
    expect(history.undo()).toBe(0);
    history.push(1, "dial", 5000);
    history.push(2, "dial", 9000);
    history.push(3, "other", 9100);
    expect([history.undo(), history.undo(), history.undo()]).toEqual([2, 1, 0]);
  });
});
