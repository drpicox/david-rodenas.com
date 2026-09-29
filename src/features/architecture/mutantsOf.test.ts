import { describe, expect, it } from "vitest";
import { mutantsOf } from "./mutantsOf";

describe("the mutants of a source: each one small change a test should catch", () => {
  it("turns a comparison, a condition and a truth into their opposites, one at a time", () => {
    const mutants = mutantsOf("const a = b === c && d;\nconst e = true;\n");
    expect(mutants.map(({ line, from, to }) => [line, from, to])).toEqual([
      [1, "===", "!=="],
      [1, "&&", "||"],
      [2, "true", "false"],
    ]);
    expect(mutants[1]?.text).toBe("const a = b === c || d;\nconst e = true;\n");
  });

  it("turns a bound over, and a step by one the other way", () => {
    expect(mutantsOf("if (i >= n) return i + 1;").map(({ from, to }) => `${from}→${to}`)).toEqual([">=→<", "+ 1→- 1"]);
  });

  it("leaves strings, templates and comments alone, and what only looks like a comparison: generics and arrows", () => {
    expect(mutantsOf('const s = "a === b"; // x && y\nconst t = `${a || b}`; /* true */\nconst m = new Map<string, number>(); const f = (x: number) => x;')).toEqual([]);
  });

  it("reads on right after a truth, and past a quote escaped inside a string", () => {
    expect(mutantsOf("a = true && b").map(({ from }) => from)).toEqual(["true", "&&"]);
    expect(mutantsOf('s = "a \\" === b"; c === d;').map(({ text }) => text)).toEqual(['s = "a \\" === b"; c !== d;']);
  });

  it("changes only the lines asked for", () => {
    expect(mutantsOf("const a = true;\nconst b = false;", new Set([2])).map(({ line }) => line)).toEqual([2]);
  });

  it("makes at most as many as asked, spread over what there is: the first, the last, and evenly between", () => {
    const many = Array.from({ length: 10 }, (_, index) => `const v${index} = true;`).join("\n");
    expect(mutantsOf(many, null, 3).map(({ line }) => line)).toEqual([1, 6, 10]);
  });

  it("leaves a shift alone, which only looks like a bound", () => {
    expect(mutantsOf("x >>= 1; y <<= 2;")).toEqual([]);
  });
});
