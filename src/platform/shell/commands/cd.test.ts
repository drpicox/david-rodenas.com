import { describe, expect, it } from "vitest";
import { Site } from "../../content/Site";
import type { ShellContext } from "../../command/Command";
import { cd } from "./cd";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nHome." },
  { file: "book/index.md", markdown: "---\ntitle: Book\n---\nThe book." },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\nThings made." },
  { file: "projects/the-book.md", markdown: "---\ntitle: The book, from here\nlink: /book/\n---\n" },
]);
const at = (cwd: string): ShellContext => ({ site, cwd, commands: [] });

describe("cd", () => {
  it("moves the session to a directory, and the address follows it", () => {
    const context = at("/");
    expect(cd.run(context, ["projects"])).toEqual({ at: "/projects/" });
    expect(context.cwd).toBe("/projects/");
  });

  it("goes home with nothing, or ~, and up with ..", () => {
    const context = at("/projects/");
    cd.run(context, []);
    expect(context.cwd).toBe("/");
    context.cwd = "/projects/";
    cd.run(context, [".."]);
    expect(context.cwd).toBe("/");
  });

  it("lands, through a link, where the page really is", () => {
    const context = at("/projects/");
    expect(cd.run(context, ["the-book"])).toEqual({ at: "/book/" });
    expect(context.cwd).toBe("/book/");
  });

  it("says there is no such directory, and stays where it was", () => {
    const context = at("/");
    expect(cd.run(context, ["nowhere"])).toEqual({ text: "cd: nowhere: no such directory", error: true });
    expect(context.cwd).toBe("/");
  });
});
