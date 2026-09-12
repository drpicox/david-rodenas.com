/**
 * The lines typed so far, and a cursor over them. Whatever is being typed
 * when the cursor leaves a line is kept with it, so browsing loses nothing.
 */
export class CommandHistory {
  private typed: string[] = [];
  private drafts: string[] = [];
  private index = 0;

  /** Everything typed so far, oldest first. */
  get lines(): readonly string[] {
    return this.typed;
  }

  add(line: string): void {
    this.typed.push(line);
    this.drafts = [...this.typed, ""];
    this.index = this.typed.length;
  }

  previous(current: string): string {
    return this.moveTo(this.index - 1, current);
  }

  next(current: string): string {
    return this.moveTo(this.index + 1, current);
  }

  private moveTo(index: number, current: string): string {
    if (this.drafts.length === 0) this.drafts = [""];
    if (index < 0 || index >= this.drafts.length) return current;
    this.drafts[this.index] = current;
    this.index = index;
    return this.drafts[index] ?? current;
  }
}
