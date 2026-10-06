import type { Cell } from "./Table";

/** A number against a number, words against words in the order a dictionary has them. */
const compared = (cell: number | string, value: string) => (typeof cell === "number" ? cell - Number(value) : cell.localeCompare(value));
const held = (cell: Cell | undefined): cell is number | string => cell !== null && cell !== undefined && cell !== "";
const listed = (value: string) => value.split(/[\s,]+/).filter(Boolean);
const same = (cell: number | string, each: string) => (typeof cell === "number" ? cell === Number(each) : cell === each);

/**
 * The tests a row's cell can be put to, each with what it is called and how
 * it is asked: equal to a value, above it, between two, one of several,
 * holding words, holding anything, holding nothing. Numbers are compared as
 * numbers and words as words; a cell that holds nothing passes only the test
 * for holding nothing. Kept apart from any node, because a table's rows and a
 * graph's files are kept by the same tests.
 */
export const ROW_TESTS: Readonly<Record<string, { readonly label: string; test(cell: Cell | undefined, value: string): boolean }>> = {
  equals: { label: "equals", test: (cell, value) => held(cell) && same(cell, value.trim()) },
  differs: { label: "differs from", test: (cell, value) => held(cell) && !same(cell, value.trim()) },
  below: { label: "is below", test: (cell, value) => held(cell) && compared(cell, value) < 0 },
  "at-most": { label: "is at most", test: (cell, value) => held(cell) && compared(cell, value) <= 0 },
  above: { label: "is above", test: (cell, value) => held(cell) && compared(cell, value) > 0 },
  "at-least": { label: "is at least", test: (cell, value) => held(cell) && compared(cell, value) >= 0 },
  between: {
    label: "is between",
    test: (cell, value) => {
      const [low = "", high = ""] = listed(value);
      return held(cell) && compared(cell, low) >= 0 && compared(cell, high) <= 0;
    },
  },
  "one-of": { label: "is one of", test: (cell, value) => held(cell) && listed(value).some((each) => same(cell, each)) },
  contains: { label: "contains", test: (cell, value) => held(cell) && String(cell).toLowerCase().includes(value.toLowerCase()) },
  "has-a-value": { label: "has a value", test: (cell) => held(cell) },
  "is-empty": { label: "is empty", test: (cell) => !held(cell) },
};
