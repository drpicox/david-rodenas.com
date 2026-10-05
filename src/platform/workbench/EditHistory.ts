/** How long two edits of one thing may be apart and still be undone as one: a hand typing a number, a slider dragged. */
const TOGETHER = 900;

/**
 * Every state a blueprint was in, to step back through and forward again.
 * Edits of one thing in quick succession — the same input typed into, the
 * same dial dragged — are kept as one, so undoing a slider is one step, not
 * forty.
 */
export class EditHistory<State> {
  private past: State[] = [];
  private future: State[] = [];
  private last: { key: string; at: number } | null = null;

  constructor(private present: State) {}

  get now(): State {
    return this.present;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** A new state; one with the same key as the edit just before, soon after it, replaces that one's instead of adding a step. */
  push(state: State, key?: string, at = Date.now()): void {
    const joined = key !== undefined && this.last?.key === key && at - this.last.at < TOGETHER;
    if (!joined) this.past.push(this.present);
    this.present = state;
    this.future = [];
    this.last = key === undefined ? null : { key, at };
  }

  undo(): State {
    const previous = this.past.pop();
    if (previous !== undefined) {
      this.future.push(this.present);
      this.present = previous;
    }
    this.last = null;
    return this.present;
  }

  redo(): State {
    const next = this.future.pop();
    if (next !== undefined) {
      this.past.push(this.present);
      this.present = next;
    }
    this.last = null;
    return this.present;
  }
}
