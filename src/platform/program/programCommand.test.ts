import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { aProgram } from "./aProgram";
import { programCommand } from "./programCommand";

const context = { site: new Site([{ file: "index.md", markdown: "---\ntitle: Home\n---\n" }]), cwd: "/", commands: [] };
const run = (...args: string[]) => programCommand(aProgram).run(context, args);

describe("a program, typed at the prompt", () => {
  it("is a command by its own name", () => {
    expect(programCommand(aProgram).name).toBe("savings");
    expect(programCommand(aProgram).description).toBe("what a sum grows to, left alone");
  });

  it("runs with the initial values when it is told nothing", () => {
    expect(run().text).toBe("121 €");
  });

  it("runs with what it was told", () => {
    expect(run("--years", "0").text).toBe("100 €");
  });

  it("prints its markup inside a program's frame, so it looks as it does on its page", () => {
    expect(run().html).toBe('<div class="app program-out"><p><strong>121</strong> €</p></div>');
  });

  it("takes a choice as a word", () => {
    expect(run("--paid", "every-month").text).toBe("122 €");
  });

  it("says what it was told wrong, and fails", () => {
    expect(run("--rate", "99")).toEqual({ text: "savings: rate: 99 is outside 0 to 20", error: true });
  });

  it("lists its options on --help, with their ranges and where they start", () => {
    const help = run("--help").text ?? "";
    expect(help).toContain("savings [--sum n] [--rate n] [--years n] [--paid once-a-year|every-month]");
    expect(help).toContain("--rate   yearly interest, in percent (0 to 20, 10)");
    expect(help).toContain("--sum    what goes in, in euros (1 to 1000000, 100)");
    expect(help).toContain("--paid   how often the interest is added (once-a-year)");
  });
});
