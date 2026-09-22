import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import type { Command } from "./Command";
import { siteCommands } from "./commands/siteCommands";
import { Shell } from "./Shell";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Hello\n\nWords." },
  { file: "book/index.md", markdown: "---\ntitle: The Book\norder: 1\n---\nA book." },
  { file: "essays/index.md", markdown: "---\ntitle: Essays\norder: 2\n---\nSome essays." },
  { file: "simulators/index.md", markdown: "---\ntitle: Simulators\norder: 3\n---\nTwo." },
  { file: "simulators/technical-debt.md", markdown: "---\ntitle: Debt\n---\nInterest." },
  { file: "night/index.md", markdown: "---\ntitle: Night\ntheme: dark\n---\nStars." },
]);

describe("Shell", () => {
  it("starts where the page is, and says so", () => {
    expect(new Shell(site, "/").prompt).toBe("~ $");
    expect(new Shell(site, "/book/").prompt).toBe("~/book $");
    expect(new Shell(site, "/simulators/technical-debt/").prompt).toBe("~/simulators/technical-debt $");
  });

  it("lists what is here: the page as README.md, the directories with a slash, and what each is after a #", () => {
    const [out] = new Shell(site, "/").run("ls");
    expect((out?.text ?? "").split("\n").map((line) => line.split(/\s+#\s+/))).toEqual([
      ["README.md", "Home"],
      ["book/", "The Book"],
      ["essays/", "Essays"],
      ["simulators/", "Simulators"],
      ["night/", "Night"],
    ]);
    // The title is a span of its own, for the stylesheet to cut to what fits.
    expect(out?.html).toContain('<span class="hint">  # The Book</span>');
  });

  it("lists somewhere else, and complains about nowhere", () => {
    expect((new Shell(site, "/").run("ls simulators")[0]?.text ?? "").split("\n").map((line) => line.split(/\s+/)[0])).toEqual(["..", "README.md", "technical-debt/"]);
    expect(new Shell(site, "/").run("ls nowhere")[0]?.text).toBe("ls: nowhere: no such directory");
  });

  it("lists as links: a directory goes there, README.md prints it here", () => {
    const html = new Shell(site, "/").run("ls")[0]?.html ?? "";
    expect(html).toContain('<a href="/book/">book/</a>');
    expect(html).toContain('<a href="/" data-run="cat README.md">README.md</a>');
    const inside = new Shell(site, "/").run("ls simulators")[0]?.html ?? "";
    expect(inside).toContain('<a href="/simulators/" data-run="cat simulators/README.md">README.md</a>');
    expect(inside).toContain('<a href="/simulators/technical-debt/">technical-debt/</a>');
    // .. goes back up by running cd, so the paper is kept; the root has no .. to offer.
    expect(inside).toContain('<a href="/" data-run="cd simulators/..">..</a>');
    expect(new Shell(site, "/simulators/").run("ls")[0]?.html).toContain('<a href="/" data-run="cd ..">..</a>');
    expect(new Shell(site, "/").run("ls")[0]?.text).not.toContain("..");
  });

  it("lists long with -l: a mode, the name, and the title, wherever the flag sits", () => {
    const long = new Shell(site, "/").run("ls -l")[0]?.text ?? "";
    expect(long.split("\n")[0]).toBe("total 5");
    expect((new Shell(site, "/simulators/").run("ls -l")[0]?.text ?? "").split("\n")[0]).toBe("total 3");
    expect(long).toContain("--r-  README.md");
    expect(long).toContain("dr-x  book/");
    expect(long).toContain("The Book");
    expect(new Shell(site, "/").run("ls -l")[0]?.html).toContain('<a href="/book/">book/</a>');
    expect(new Shell(site, "/").run("ls simulators -l")[0]?.text).toContain("dr-x  technical-debt/");
    expect(new Shell(site, "/").run("ls -x")[0]?.error).toBe(true);
  });

  it("changes directory, and says where the session now is so the address can follow without the paper changing", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("cd book")).toEqual([{ at: "/book/" }]);
    expect(shell.prompt).toBe("~/book $");
    expect(shell.run("cd")).toEqual([{ at: "/" }]);
    expect(shell.run("cd nowhere")).toEqual([{ text: "cd: nowhere: no such directory", error: true }]);
  });

  it("prints a page, rendered, whether asked for README.md, * or its directory", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("cat README.md")[0]?.html).toContain("<h1");
    expect(shell.run("cat book/README.md")[0]?.html).toContain("A book.");
    expect(shell.run("cat book/README.md")[0]?.at).toBe("/book/");
    expect(shell.prompt).toBe("~ $");
    expect(shell.run("cat book")[0]?.html).toContain("A book.");
    expect(new Shell(site, "/book/").run("cat *")[0]?.html).toContain("A book.");
    expect(shell.run("cat nothing.md")).toEqual([{ text: "cat: nothing.md: no such file", error: true }]);
  });

  it("finds every page under a directory, or only those with a word in the name or title", () => {
    const all = new Shell(site, "/").run("find")[0]?.text ?? "";
    expect(all.split("\n")).toHaveLength(6);
    expect(all).toContain("/simulators/technical-debt/  # Debt");
    expect((new Shell(site, "/").run("find simulators")[0]?.text ?? "").split("\n")).toHaveLength(2);
    expect(new Shell(site, "/").run("find debt")[0]?.text).toBe("/simulators/technical-debt/  # Debt");
    expect(new Shell(site, "/").run("find simulators DEBT")[0]?.text).toBe("/simulators/technical-debt/  # Debt");
    expect(new Shell(site, "/").run("find nowhere/")[0]?.error).toBe(true);
    expect(new Shell(site, "/").run("find")[0]?.html).toContain('<a href="/book/">/book/</a>');
  });

  it("greps the pages for a word, whatever its case, and says where each line is", () => {
    const out = new Shell(site, "/").run("grep interest")[0];
    expect(out?.text).toBe("/simulators/technical-debt/:1: Interest.");
    expect(out?.html).toContain('<a href="/simulators/technical-debt/">/simulators/technical-debt/</a>:1:');
    expect(out?.html).toContain("<mark>Interest</mark>");
    expect(new Shell(site, "/").run("grep essays")[0]?.text).toContain("/essays/:1: Some essays.");
    expect(new Shell(site, "/").run("grep essays book")[0]?.text).toContain("no page under book");
    expect(new Shell(site, "/").run("grep")[0]?.error).toBe(true);
  });

  it("knows where it is", () => {
    expect(new Shell(site, "/book/").run("pwd")).toEqual([{ text: "~/book" }]);
  });

  it("helps, in general and in particular", () => {
    const help = new Shell(site, "/").run("help")[0]?.text ?? "";
    for (const name of ["ls", "cd", "cat", "find", "grep", "pwd", "help", "clear"]) expect(help).toContain(name);
    expect(new Shell(site, "/").run("help cd")[0]?.text).toContain("cd [dir]");
    // As markup it is a list of terms, which folds on a narrow screen instead of wrapping mid-column.
    expect(new Shell(site, "/").run("help")[0]?.html).toContain('<dt><a href="#" data-run="help ls">ls [-l] [path]</a></dt>');
    expect(new Shell(site, "/").run("help nope")[0]?.error).toBe(true);
  });

  it("clears, by asking the page to", () => {
    expect(new Shell(site, "/").run("clear")).toEqual([{ clear: true }]);
  });

  // The shell is handed its commands, so a feature's are indistinguishable from the site's own.
  it("runs a command it was handed, and helps with it", () => {
    const shout: Command = {
      name: "shout",
      usage: "shout [word]",
      description: "say it louder",
      run: (_context, [word = ""]) => ({ text: word.toUpperCase() }),
    };
    const shell = new Shell(site, "/", [...siteCommands, shout]);
    expect(shell.run("shout hello")).toEqual([{ text: "HELLO" }]);
    expect(shell.run("help")[0]?.text).toContain("say it louder");
    expect(shell.complete("sh")).toEqual(["shout"]);
  });

  it("runs a whole line, and stops at the first error", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("cd book && cat *")).toHaveLength(2);
    expect(shell.run("cd nowhere && cat *")).toHaveLength(1);
  });

  it("can be moved by the page, when the page moves on its own", () => {
    const shell = new Shell(site, "/");
    expect(shell.moveTo("/essays/")).toBe(true);
    expect(shell.prompt).toBe("~/essays $");
    expect(shell.moveTo("/nowhere/")).toBe(false);
    expect(shell.prompt).toBe("~/essays $");
  });

  it("does not know commands it does not have", () => {
    expect(new Shell(site, "/").run("rm -rf /")).toEqual([{ text: "rm: command not found. Try help", error: true }]);
  });

  it("completes a command, then a path", () => {
    const shell = new Shell(site, "/");
    expect(shell.complete("c")).toEqual(["cat", "cd", "clear"]);
    expect(shell.complete("cd b")).toEqual(["cd book/"]);
    expect(shell.complete("cat simulators/t")).toEqual(["cat simulators/technical-debt/"]);
    expect(shell.complete("cat R")).toEqual(["cat README.md"]);
    expect(shell.complete("cd zzz")).toEqual([]);
  });
});
