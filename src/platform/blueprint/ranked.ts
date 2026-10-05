/** Each value's rank among them, from 1 for the smallest; equal values share the mean of the ranks they span, as Spearman's correlation needs. */
export function ranked(values: readonly number[]): number[] {
  const order = values.map((value, at) => ({ value, at })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length).fill(0);
  for (let start = 0; start < order.length; ) {
    let end = start;
    while (end + 1 < order.length && order[end + 1]?.value === order[start]?.value) end += 1;
    for (let at = start; at <= end; at += 1) ranks[order[at]?.at ?? 0] = (start + end) / 2 + 1;
    start = end + 1;
  }
  return ranks;
}
