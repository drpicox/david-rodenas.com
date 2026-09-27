import { describe, expect, it } from "vitest";
import { importsOf } from "./importsOf";

describe("what a file imports, as the compiler reads it", () => {
  it("reads each import and re-export, and whether it needs a value or only a type", () => {
    const source = [
      'import { a } from "./a";',
      'import type { B } from "./b";',
      'import { type C, type D } from "./c";',
      'import { type E, f } from "./e";',
      'export { g } from "./g";',
      'export type { H } from "./h";',
      'import "./styles.css";',
    ].join("\n");
    expect(importsOf(source)).toEqual([
      { specifier: "./a", typeOnly: false },
      { specifier: "./b", typeOnly: true },
      { specifier: "./c", typeOnly: true },
      { specifier: "./e", typeOnly: false },
      { specifier: "./g", typeOnly: false },
      { specifier: "./h", typeOnly: true },
      { specifier: "./styles.css", typeOnly: false },
    ]);
  });

  it("is not fooled by an import written in a string or a comment", () => {
    expect(importsOf('// import { x } from "./x";\nconst s = \'import { y } from "./y"\';')).toEqual([]);
  });

  it("reads a dynamic import with a string in it", () => {
    expect(importsOf('const m = await import("./later");')).toEqual([{ specifier: "./later", typeOnly: false }]);
  });
});
