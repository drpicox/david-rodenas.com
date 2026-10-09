/** Which of a list is chosen after an arrow key: the next one down or up, round from the last to the first and back; from none, the first or the last. */
export function steppedTo(current: number, count: number, key: string): number {
  if (count === 0) return -1;
  if (key === "ArrowDown") return current < 0 ? 0 : (current + 1) % count;
  if (key === "ArrowUp") return current < 0 ? count - 1 : (current - 1 + count) % count;
  return current;
}
