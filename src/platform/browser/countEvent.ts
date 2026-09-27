/** How long to wait for the counter's script, which loads on its own time, before giving an event up. */
const PATIENCE = 10_000;
const waiting: string[] = [];
let polling: ReturnType<typeof setInterval> | null = null;

function flush(): boolean {
  const count = window.goatcounter?.count;
  if (!count) return false;
  for (const path of waiting.splice(0)) count({ path, title: path, event: true });
  return true;
}

/**
 * Counts an event with GoatCounter: a name, and nothing about who did it.
 * GoatCounter counts a name once a visit, so an event says how many visits
 * did a thing, not how many times. The counter's script loads when it likes,
 * so what is counted before it arrives waits for it, a little while.
 */
export function countEvent(name: string): void {
  waiting.push(name);
  if (flush() || polling) return;
  const started = Date.now();
  polling = setInterval(() => {
    if (flush() || Date.now() - started > PATIENCE) {
      if (polling) clearInterval(polling);
      polling = null;
      waiting.splice(0);
    }
  }, 250);
}
