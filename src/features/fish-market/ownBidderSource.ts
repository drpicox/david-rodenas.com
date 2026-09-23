/**
 * What the visitor's editor starts with: Vicente, in eight lines of
 * JavaScript, so that the first thing a visitor seats already wins — and the
 * first thing they change is the 0.9.
 */
export const ownBidderSource = `// Return the margin you demand: (value - price) / price.
// You are told the lots still to sell, everyone's credit, and every sale so far.
// This is Vicente. Change the 0.9 first.
const fish = market.lots.reduce((sum, lot) => sum + lot.value, 0);
const money = 0.9 * Object.values(market.credits).reduce((sum, c) => sum + c, 0);
if (money <= 0) return 0.001;
return Math.max(0.001, (fish - money) / money);
`;
