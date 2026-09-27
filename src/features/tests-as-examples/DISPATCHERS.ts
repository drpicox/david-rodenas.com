import type { Dispatcher } from "./Dispatcher";

/**
 * The dispatcher the essay's tests imply, and two others: the same one
 * refactored — its array renamed and made private, so that nothing a user can
 * see changes — and one with a bug where its two halves meet, which each of
 * the tests that look inside checks on its own.
 */
export const DISPATCHERS: readonly Dispatcher[] = [
  {
    name: "original",
    label: "Original",
    said: "The dispatcher the three tests imply: its listeners kept in an array, _queue.",
    source: `class Dispatcher {
  _queue = [];

  addListener(cb) {
    this._queue.push(cb);
  }

  deliver(message) {
    this._queue.forEach((cb) => cb(message));
  }
}`,
  },
  {
    name: "refactored",
    label: "Refactored",
    said: "The same array, renamed and made private. Nothing a user of it can see has changed.",
    source: `class Dispatcher {
  #listeners = [];

  addListener(cb) {
    this.#listeners.push(cb);
  }

  deliver(message) {
    this.#listeners.forEach((cb) => cb(message));
  }
}`,
  },
  {
    name: "with-a-bug",
    label: "With a bug",
    said: "addListener now copies the queue instead of changing it, and deliver, bound once in the constructor, still reads the first one.",
    source: `class Dispatcher {
  _queue = [];

  constructor() {
    const queue = this._queue;
    this.deliver = (message) => queue.forEach((cb) => cb(message));
  }

  addListener(cb) {
    this._queue = [...this._queue, cb];
  }
}`,
  },
];
