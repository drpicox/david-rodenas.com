import { describe, expect, it } from "vitest";
import { valueExportsOf } from "./valueExportsOf";

describe("the values a file exports", () => {
  it("are its functions, classes and constants, and not its types, which may travel with them", () => {
    const source = "export interface A {}\nexport type B = 1;\nexport function c() {}\nexport const d = 1, e = 2;\nexport class F {}\nexport default 3;\nexport { g };\nexport type { H };";
    expect(valueExportsOf(source)).toEqual(["c", "d", "e", "F", "default", "g"]);
  });
});
