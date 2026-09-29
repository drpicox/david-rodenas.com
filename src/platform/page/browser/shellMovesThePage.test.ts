// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Outcome } from "../../command/Outcome";
import { Site } from "../../content/Site";
import { Shell } from "../../shell/Shell";
import { mountTerminal } from "../../shell/browser/mountTerminal";
import { cat } from "../../shell/commands/cat";
import { cd } from "../../shell/commands/cd";
import { help } from "../../shell/commands/help";
import { renderDocument } from "../renderDocument";
import { mountNavigation } from "./mountNavigation";

/**
 * The shell decides where a command leads, and the page goes there. cd and
 * cat answer with where the session now is; the navigation moves the page to
 * it without a load, and keeps the paper, what the shell printed. The shell is
 * the same in node, where it is tested alone, and in the page, where it is
 * wired to the navigation as the composition root wires it: here the two are
 * held to the same answer. And a command's name that help prints runs where it
 * is, which the navigation must leave alone.
 */
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nHome." },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\n---\nThings made." },
]);
const COMMANDS = [cd, cat, help];

/** The document the build writes for a route, with the terminal and the navigation wired to each other as main.ts wires them. */
function wired(route: string) {
  const page = site.at(route);
  if (!page) throw new Error(`no page at ${route}`);
  const html = renderDocument(site, page, { origin: "https://example.com" });
  document.replaceChild(document.adoptNode(new DOMParser().parseFromString(html, "text/html").documentElement), document.documentElement);
  window.history.replaceState(null, "", route);
  let terminal: ReturnType<typeof mountTerminal> = null;
  const goTo = mountNavigation(site, (arrived, kept) => {
    if (!kept) terminal?.moveTo(arrived.route);
  });
  terminal = mountTerminal(site, route, { moveTo: (to) => goTo(to, { keep: true }), commands: COMMANDS });
  if (!terminal) throw new Error("no terminal on the page");
  return terminal;
}

describe("a move the shell makes, and the page making it", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Element.prototype.scrollIntoView ??= () => {};
  });

  it("goes where the shell says cd leads, without a load, and keeps what was printed", () => {
    const [said]: Outcome[] = new Shell(site, "/", COMMANDS).run("cd projects");
    const terminal = wired("/");
    terminal.run("help");
    terminal.run("cd projects");
    expect(window.location.pathname).toBe(said?.at);
    expect(document.title).toBe("Projects — David Rodenas");
    expect(document.querySelector(".screen")?.textContent).toContain("Commands:");
  });

  it("prints what the shell says cat prints, and moves to the page it printed", () => {
    const [said] = new Shell(site, "/", COMMANDS).run("cat projects/README.md");
    const terminal = wired("/");
    terminal.run("cat projects/README.md");
    expect(window.location.pathname).toBe(said?.at);
    expect(document.querySelector(".screen")?.innerHTML).toContain(said?.html ?? "nothing printed");
  });

  it("runs a command's name help printed where it is, and stays on the page", () => {
    const terminal = wired("/");
    terminal.run("help");
    document.querySelector<HTMLAnchorElement>('.screen a[data-run="help cd"]')?.click();
    expect(window.location.pathname).toBe("/");
    expect(document.querySelector(".screen")?.textContent).toContain(cd.usage);
  });
});
