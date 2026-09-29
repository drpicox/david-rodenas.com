import { describe, expect, it } from "vitest";
import { siteCommands } from "../platform/shell/commands/siteCommands";
import { allFeatures } from "./allFeatures";

/** What the list of features is: each one once, and nothing in it that would take another's place. */
describe("the features the site installs", () => {
  it("are each installed once, by a name of its own", () => {
    const names = allFeatures.map((feature) => feature.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("bring no command by a name another feature's command, or one of the site's own, already has: the shell would answer only one", () => {
    const names = [...siteCommands, ...allFeatures.flatMap((feature) => feature.commands ?? [])].map((command) => command.name);
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it("bring no program, and no place on a page, by a name another already has", () => {
    const programs = allFeatures.flatMap((feature) => feature.programs ?? []).map((program) => program.name);
    expect(programs.filter((name, index) => programs.indexOf(name) !== index)).toEqual([]);
    const places = allFeatures.flatMap((feature) => Object.keys(feature.apps ?? {}));
    expect(places.filter((name, index) => places.indexOf(name) !== index)).toEqual([]);
  });
});
