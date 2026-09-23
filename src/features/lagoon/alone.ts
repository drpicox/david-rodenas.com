/**
 * The orders a bot gives when it imagines itself alone on the lagoon: each
 * week it looks at what it thinks is there, orders by its rule, and breeds
 * what it left. The starter's strategies planned this way, because nobody is
 * told what the others will do until the round is over.
 */
export function alone(fish: number, weeks: number, rule: (fishNow: number, week: number) => number): number[] {
  const orders: number[] = [];
  let left = fish;
  for (let week = 0; week < weeks; week += 1) {
    const order = Math.max(0, Math.min(left, Math.floor(rule(left, week))));
    orders.push(order);
    left -= order;
    left += Math.floor(left / 2);
  }
  return orders;
}
