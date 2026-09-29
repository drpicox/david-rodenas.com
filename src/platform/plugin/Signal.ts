/**
 * Something one feature announces and another may listen for, with neither
 * holding a reference to the other.
 *
 * It is here so that a feature can react to a thing that happens somewhere
 * else without importing the code that does it. The world announces that it
 * turned; the composition hands the announcement to the sky, which follows.
 * Take the sky away and the world still turns, and says so to nobody, which
 * costs nothing; take the world away and the sky still drifts.
 */
export class Signal<T> {
  private readonly listeners = new Set<(value: T) => void>();

  send(value: T): void {
    // A copy, so a listener that stops listening mid-send does not cut the rest short.
    for (const listener of [...this.listeners]) listener(value);
  }

  /** Returns how to stop listening. */
  on(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
