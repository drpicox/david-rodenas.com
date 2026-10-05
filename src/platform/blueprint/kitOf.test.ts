import { describe, expect, it } from "vitest";
import { kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import type { PinType } from "./PinType";

const kind = (name: string): NodeKind => ({ name, title: name, role: "step", shelf: "Tables", summary: "", inputs: [], outputs: [], run: () => ({}) });
const type = (name: string): PinType => ({ name, label: `a ${name}`, colour: `--bp-${name}`, describe: () => name });

describe("a kit: every kind of node and every kind of wire a blueprint can name", () => {
  it("finds each kind and each type by its name", () => {
    const kit = kitOf([kind("filter"), kind("join")], [type("table")]);
    expect(kit.kinds.get("join")?.name).toBe("join");
    expect(kit.types.get("table")?.label).toBe("a table");
  });

  it("refuses two kinds by one name, which a blueprint's text could not tell apart", () => {
    expect(() => kitOf([kind("filter"), kind("filter")], [])).toThrow("two kinds of node are called filter");
  });

  it("refuses two types by one name", () => {
    expect(() => kitOf([], [type("table"), type("table")])).toThrow("two kinds of wire are called table");
  });
});
