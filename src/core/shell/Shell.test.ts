import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
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

  it("lists what is here: the page as README.md, the directories with a slash", () => {
    const [out] = new Shell(site, "/").run("ls");
    expect(out?.text).toBe("README.md\nbook/\nessays/\nsimulators/\nnight/");
  });

  it("lists somewhere else, and complains about nowhere", () => {
    expect(new Shell(site, "/").run("ls simulators")[0]?.text).toBe("README.md\ntechnical-debt/");
    expect(new Shell(site, "/").run("ls nowhere")[0]?.text).toBe("ls: nowhere: no such directory");
  });

  it("lists as links: a directory goes there, README.md prints it here", () => {
    const html = new Shell(site, "/").run("ls")[0]?.html ?? "";
    expect(html).toContain('<a href="/book/">book/</a>');
    expect(html).toContain('<a href="/" data-run="cat README.md">README.md</a>');
    const inside = new Shell(site, "/").run("ls simulators")[0]?.html ?? "";
    expect(inside).toContain('<a href="/simulators/" data-run="cat simulators/README.md">README.md</a>');
    expect(inside).toContain('<a href="/simulators/technical-debt/">technical-debt/</a>');
  });

  it("lists long with -l: a mode, the name, and the title, wherever the flag sits", () => {
    const long = new Shell(site, "/").run("ls -l")[0]?.text ?? "";
    expect(long.split("\n")[0]).toBe("total 5");
    expect(long).toContain("--r-  README.md");
    expect(long).toContain("dr-x  book/");
    expect(long).toContain("The Book");
    expect(new Shell(site, "/").run("ls -l")[0]?.html).toContain('<a href="/book/">book/</a>');
    expect(new Shell(site, "/").run("ls simulators -l")[0]?.text).toContain("dr-x  technical-debt/");
    expect(new Shell(site, "/").run("ls -x")[0]?.error).toBe(true);
  });

  it("changes directory by asking the page to move", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("cd book")).toEqual([{ navigate: "/book/" }]);
    expect(shell.prompt).toBe("~/book $");
    expect(shell.run("cd")).toEqual([{ navigate: "/" }]);
    expect(shell.run("cd nowhere")).toEqual([{ text: "cd: nowhere: no such directory", error: true }]);
  });

  it("prints a page, rendered, whether asked for README.md, * or its directory", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("cat README.md")[0]?.html).toContain("<h1");
    expect(shell.run("cat book/README.md")[0]?.html).toContain("A book.");
    expect(shell.run("cat book")[0]?.html).toContain("A book.");
    expect(new Shell(site, "/book/").run("cat *")[0]?.html).toContain("A book.");
    expect(shell.run("cat nothing.md")).toEqual([{ text: "cat: nothing.md: no such file", error: true }]);
  });

  it("knows where it is", () => {
    expect(new Shell(site, "/book/").run("pwd")).toEqual([{ text: "~/book" }]);
  });

  it("helps, in general and in particular", () => {
    const help = new Shell(site, "/").run("help")[0]?.text ?? "";
    for (const name of ["ls", "cd", "cat", "pwd", "help", "clear", "theme"]) expect(help).toContain(name);
    expect(new Shell(site, "/").run("help cd")[0]?.text).toContain("cd [dir]");
    expect(new Shell(site, "/").run("help nope")[0]?.error).toBe(true);
  });

  it("clears, and changes the theme, by asking the page to", () => {
    const shell = new Shell(site, "/");
    expect(shell.run("clear")).toEqual([{ clear: true }]);
    expect(shell.run("theme dark")).toEqual([{ theme: "dark", text: "theme: dark" }]);
    expect(shell.run("theme")).toEqual([{ theme: "toggle", text: "theme: toggled" }]);
    expect(shell.run("theme system")[0]?.theme).toBe("system");
    expect(shell.run("theme purple")[0]?.error).toBe(true);
  });

  it("will not change the theme on a page that insists on its own", () => {
    const shell = new Shell(site, "/night/");
    expect(shell.run("theme light")).toEqual([{ text: "theme: this page keeps its own, dark. It works everywhere else.", error: true }]);
    expect(shell.run("theme")[0]?.theme).toBeUndefined();
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
