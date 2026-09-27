import { describe, expect, it } from "vitest";
import { onlyTypes } from "./onlyTypes";

describe("a file with nothing in it to run", () => {
  it("is one of interfaces and types, whatever it imports", () => {
    expect(onlyTypes('import type { A } from "./a";\nimport { B } from "./b";\nexport interface C { a: A }\nexport type D = B | C;\n')).toBe(true);
  });

  it("is not one with a value in it, exported or not", () => {
    expect(onlyTypes("export interface A {}\nexport const b = 1;")).toBe(false);
    expect(onlyTypes("interface A {}\nconst hidden = 1;\nexport type B = A;")).toBe(false);
  });

  it("is not one that only runs, like a composition root", () => {
    expect(onlyTypes('import { mount } from "./mount";\nmount();')).toBe(false);
  });

  it("is not one of nothing but imports: an import runs what it imports", () => {
    expect(onlyTypes('import { Theme } from "./Theme";\n')).toBe(false);
  });
});
