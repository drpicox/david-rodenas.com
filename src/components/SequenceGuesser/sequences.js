const sequences = [
  { rule: (a, b, c) => a < b && b < c, example: [2, 4, 8] },
  {
    rule: (a, b, c) => a + 1 < b && b + 1 < c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a + 1 < b && b + 2 < c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a <= b && b <= c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a <= b && b < c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a < b && b <= c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => 2 * a === b && 2 * b === c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a > 0 && b > 0 && c > 0,
    example: [2, 4, 8],
  },
  { rule: (a, b, c) => a === 2, example: [2, 4, 8] },
  { rule: (a, b, c) => b === 4, example: [2, 4, 8] },
  { rule: (a, b, c) => c === 8, example: [2, 4, 8] },
  { rule: (a, b, c) => c > 3, example: [2, 4, 8] },
  { rule: (a, b, c) => a + b + c > 5, example: [2, 4, 8] },
  { rule: (a, b, c) => a + b + c >= 5, example: [2, 4, 8] },
  { rule: (a, b, c) => a + b < c, example: [2, 4, 8] },
  { rule: (a, b, c) => a + b <= c, example: [2, 4, 8] },
  { rule: (a, b, c) => c - a > b, example: [2, 4, 8] },
  { rule: (a, b, c) => a * b === c, example: [2, 4, 8] },
  { rule: (a, b, c) => a * b <= c, example: [2, 4, 8] },
  { rule: (a, b, c) => a * b >= c, example: [2, 4, 8] },
  {
    rule: (a, b, c) => a !== b && b !== c && a !== c,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a === 2 && b === 4 && c === 8,
    example: [2, 4, 8],
  },
  {
    rule: (a, b, c) => a % 2 === 0 && b % 2 === 0 && c % 2 === 0,
    example: [2, 4, 8],
  },
]

export default sequences
