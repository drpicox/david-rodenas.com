import { describe, expect, it } from "vitest";
import { Site } from "../../content/Site";
import type { ShellContext } from "../../command/Command";
import { cat } from "./cat";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nHome." },
  { file: "book/index.md", markdown: "---\ntitle: Book\n---\nThe *book*." },
]);
const at = (cwd: string): ShellContext => ({ site, cwd, commands: [] });

describe("cat", () => {
  it("prints a page, the README.md of its directory, and the address follows it", () => {
    expect(cat.run(at("/"), ["book/README.md"])).toEqual({ html: "<p>The <em>book</em>.</p>", at: "/book/" });
  });

  it("takes * for the page here, as README.md", () => {
    expect(cat.run(at("/book/"), ["*"])).toEqual(cat.run(at("/book/"), ["README.md"]));
  });

  it("prints a directory's page by the directory's name too, and finds no other markdown file, nor a page that is not there", () => {
    expect(cat.run(at("/"), ["book"])).toEqual(cat.run(at("/"), ["book/README.md"]));
    expect(cat.run(at("/"), ["book/notes.md"])).toEqual({ text: "cat: book/notes.md: no such file", error: true });
    expect(cat.run(at("/"), ["nowhere/README.md"])).toEqual({ text: "cat: nowhere/README.md: no such file", error: true });
  });

  it("says how it is used, asked for nothing", () => {
    expect(cat.run(at("/"), [])).toEqual({ text: "cat: usage: cat <file>", error: true });
  });
});
