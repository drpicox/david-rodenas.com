/**
 * The parts of a graph whose nodes all reach each other, following the
 * arrows: its strongly connected components, by Tarjan's algorithm (1972). A
 * node on no circle is a part of its own. The parts come out as the algorithm
 * closes them, each after every part it can reach.
 */
export function stronglyConnectedOf<T>(nodes: readonly T[], next: (node: T) => Iterable<T>): T[][] {
  let counter = 0;
  const index = new Map<T, number>();
  const low = new Map<T, number>();
  const stack: T[] = [];
  const onStack = new Set<T>();
  const parts: T[][] = [];
  const connect = (node: T): void => {
    index.set(node, counter);
    low.set(node, counter);
    counter += 1;
    stack.push(node);
    onStack.add(node);
    for (const after of next(node)) {
      if (!index.has(after)) {
        connect(after);
        low.set(node, Math.min(low.get(node) ?? 0, low.get(after) ?? 0));
      } else if (onStack.has(after)) {
        low.set(node, Math.min(low.get(node) ?? 0, index.get(after) ?? 0));
      }
    }
    if (low.get(node) !== index.get(node)) return;
    const part: T[] = [];
    for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
      onStack.delete(top);
      part.push(top);
      if (top === node) break;
    }
    parts.push(part);
  };
  for (const node of nodes) if (!index.has(node)) connect(node);
  return parts;
}
