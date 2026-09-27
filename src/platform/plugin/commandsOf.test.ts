import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { commandsOf } from "./commandsOf";

describe("the commands the features bring", () => {
  it("are their own, and one for every program", () => {
    const own = { name: "own", usage: "own", description: "", run: () => ({}) };
    expect(commandsOf([{ name: "one", commands: [own] }, { name: "two", programs: [aProgram] }]).map((command) => command.name)).toEqual(["own", "savings"]);
  });
});
