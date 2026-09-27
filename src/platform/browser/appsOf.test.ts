// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { appsOf } from "./appsOf";

describe("the programs a page makes room for", () => {
  it("put a feature's program on plain dials", () => {
    const host = document.createElement("div");
    appsOf([{ name: "one", programs: [aProgram] }])["savings"]?.(host, { site: undefined as never });
    expect(host.querySelectorAll('input[type="range"]')).toHaveLength(3);
  });

  it("let a feature bring an app of its own for its program, to draw a page around it", () => {
    const own = () => {};
    expect(appsOf([{ name: "one", programs: [aProgram], apps: { savings: own } }])["savings"]).toBe(own);
  });
});
