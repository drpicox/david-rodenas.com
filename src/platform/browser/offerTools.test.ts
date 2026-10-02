// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { programTool } from "../plugin/programTool";
import { siteTools } from "../agent/siteTools";
import { Site } from "../content/Site";
import { aProgram } from "../program/aProgram";
import type { Outcome } from "../command/Outcome";
import { cat } from "../shell/commands/cat";
import { cd } from "../shell/commands/cd";
import { find } from "../shell/commands/find";
import { grep } from "../shell/commands/grep";
import { help } from "../shell/commands/help";
import { ls } from "../shell/commands/ls";
import { mountProgram } from "./mountProgram";
import type { ModelContext, Tool } from "./ModelContext";
import { offerTools } from "./offerTools";

const ORIGIN = "https://david-rodenas.com";
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n" },
  { file: "money.md", markdown: "---\ntitle: Money\n---\n# Money\n\n::savings\n" },
]);

function aBrowser() {
  const tools = new Map<string, Tool>();
  const context: ModelContext = { registerTool: (tool) => void tools.set(tool.name, tool) };
  const visited: string[] = [];
  const typed: string[] = [];
  // Going to the money page is putting its program's place on the page, as the navigation does, and mounting it.
  const goTo = (route: string) => {
    visited.push(route);
    document.body.innerHTML = route === "/money/" ? '<div class="app" data-app="savings"></div>' : "";
    const host = document.querySelector<HTMLElement>('.app[data-app="savings"]');
    if (host) mountProgram(aProgram)(host, { site });
    return true;
  };
  const run = (line: string): Outcome[] => {
    typed.push(line);
    return [{ html: "<p>README.md  money/</p>" }];
  };
  document.body.innerHTML = "";
  offerTools(context, { tools: [...siteTools, programTool(aProgram)], site, origin: ORIGIN, read: () => Promise.reject(new Error("no files here")), goTo, run });
  const call = async (name: string, input: Record<string, unknown>) => JSON.parse(await tools.get(name)!.execute(input)) as Record<string, unknown>;
  return { tools, visited, typed, call };
}

describe("the tools this site offers an agent in the reader's browser", () => {
  it("are the ones it is handed, each told of with how it answers, and one more for the prompt", () => {
    const { tools } = aBrowser();
    expect([...tools.keys()]).toEqual(["read", "search", "savings", "shell"]);
    expect(tools.get("savings")?.description).toContain("what a sum grows to, left alone");
    expect(tools.get("savings")?.inputSchema).toMatchObject({ properties: { rate: { type: "number", maximum: 20 }, show: { type: "boolean" } } });
  });

  it("answer as JSON: the words, the figures, the page, and whether the reader was shown it", async () => {
    const { call } = aBrowser();
    expect(await call("savings", { years: 0 })).toEqual({ summary: "100 €", data: { grown: 100 }, url: `${ORIGIN}/money/`, shown: true });
  });

  it("show the reader what the agent asked, unless told not to: they go to the program's page, and its dials move", async () => {
    const { call, visited } = aBrowser();
    await call("savings", { rate: 0 });
    expect(visited).toEqual(["/money/"]);
    expect(document.querySelector(".program-line")?.textContent).toBe("$ savings --rate 0");
    expect(document.querySelector<HTMLInputElement>('input[name="rate"]')?.value).toBe("0");
  });

  it("stay on the page when the program is already on it", async () => {
    const { call, visited } = aBrowser();
    await call("savings", {});
    await call("savings", { years: 5 });
    expect(visited).toEqual(["/money/"]);
  });

  it("leave the reader's page as it is when told show: false, and say so", async () => {
    const { call, visited } = aBrowser();
    expect(await call("savings", { years: 0, show: false })).toMatchObject({ summary: "100 €", shown: false });
    expect(visited).toEqual([]);
  });

  it("refuse what the program would refuse, and say why, without moving anything", async () => {
    const { call, visited } = aBrowser();
    expect(await call("savings", { rate: 99 })).toEqual({ summary: "Refused, nothing was run: rate: 99 is outside 0 to 20", refused: true });
    expect(await call("savings", { show: "yes" })).toEqual({ summary: "Refused, nothing was run: show: yes is not true or false", refused: true });
    expect(visited).toEqual([]);
  });

  it("read a page without a line at the prompt or a move on the reader's screen", async () => {
    const { call, visited, typed } = aBrowser();
    expect(await call("read", { path: "money" })).toMatchObject({ summary: "Money", url: `${ORIGIN}/money/` });
    expect(visited).toEqual([]);
    expect(typed).toEqual([]);
  });

  it("tell the agent of the prompt by the commands the shell has to get around the site", () => {
    const { tools } = aBrowser();
    const description = tools.get("shell")?.description ?? "";
    for (const command of [ls, cd, cat, find, grep, help]) expect(description).toMatch(new RegExp(`\\b${command.name}\\b`));
  });

  it("run a line at the prompt, where the reader sees it typed, and answer with what it printed", async () => {
    const { call, typed } = aBrowser();
    expect(await call("shell", { line: "ls" })).toEqual({ summary: "README.md money/", shown: true });
    expect(typed).toEqual(["ls"]);
  });
});

describe("a browser with no model context", () => {
  it("is offered nothing, and nothing breaks", () => {
    expect(() => offerTools(undefined, { tools: siteTools, site, origin: ORIGIN, read: () => Promise.reject(new Error("no files here")), goTo: () => true, run: () => [] })()).not.toThrow();
  });
});
