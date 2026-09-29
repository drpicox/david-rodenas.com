import { describe, expect, it } from "vitest";
import { Site } from "../../content/Site";
import type { Command, ShellContext } from "../../command/Command";
import { help } from "./help";

const echo: Command = { name: "echo", usage: "echo <words>", description: "say the words back", run: (_, words) => ({ text: words.join(" ") }) };
const context = (): ShellContext => ({ site: new Site([]), cwd: "/", commands: [echo, help] });

describe("help", () => {
  it("lists every command, with how it is used and what it does, lined up, and the keys the prompt knows", () => {
    const { text = "", html = "" } = help.run(context(), []);
    // Lined up: every description starts where the longest usage ends, and two spaces after.
    expect(text).toContain("echo <words>    say the words back");
    expect(text).toContain("help [command]  this");
    expect(text).toContain("Tab completes");
    expect(html).toContain('<a href="#" data-run="help echo">echo &lt;words&gt;</a>');
  });

  it("says one command, asked for it", () => {
    expect(help.run(context(), ["echo"])).toEqual({ text: "echo <words>\n  say the words back" });
  });

  it("says there is no such command", () => {
    expect(help.run(context(), ["nope"])).toEqual({ text: "help: nope: no such command", error: true });
  });
});
