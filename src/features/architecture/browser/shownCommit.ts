import { Signal } from "../../../platform/plugin/Signal";

/**
 * The commit every figure of the page on how the source changes is showing,
 * one for all of them: the player moves it, a commit pressed on the picture of
 * changes moves it, and every figure follows. None stands for the last.
 */
class ShownCommit {
  private at: number | null = null;
  private readonly moved = new Signal<number | null>();

  get(): number | null {
    return this.at;
  }

  set(at: number | null): void {
    if (at === this.at) return;
    this.at = at;
    this.moved.send(at);
  }

  /** Returns how to stop listening. */
  on(listener: (at: number | null) => void): () => void {
    return this.moved.on(listener);
  }
}

export const shownCommit = new ShownCommit();
