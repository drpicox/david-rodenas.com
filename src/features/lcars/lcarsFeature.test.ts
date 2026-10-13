// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import { benchOf } from "../../platform/plugin/benchOf";
import { FilesInBrowser } from "../../platform/workbench/browser/FilesInBrowser";
import { lcarsFeature } from "./lcarsFeature";

describe("the blueprints as a starship's display, on trial", () => {
  it("is asked for by a flag of its own, which no reader has on unless they switch it on", () => {
    const [flag] = lcarsFeature.flags ?? [];
    expect(flag).toMatchObject({ name: "lcars" });
    expect(flag?.trial).toBeUndefined();
    expect(benchOf([lcarsFeature], () => false)).toBeUndefined();
  });

  it("is, under that flag, the bench a blueprint in a page opens at", () => {
    const make = benchOf([lcarsFeature], (flag) => flag === "lcars");
    const bench = make?.({ kit: aKit, files: new FilesInBrowser(async () => ""), examples: [{ title: "Nights", slug: "nights", about: "", text: "n = nights" }], own: { get: () => null, set: () => {} }, linkTo: () => "", copy: async () => {} });
    expect(bench?.element.classList.contains("lcars")).toBe(true);
    expect(bench?.element.querySelector('.lc-module[data-node="n"]')).not.toBeNull();
  });
});
