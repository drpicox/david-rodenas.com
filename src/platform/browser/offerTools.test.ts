// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { aProgram } from "../program/aProgram";
import type { Outcome } from "../command/Outcome";
import { mountProgram } from "./mountProgram";
import type { ModelContext, Tool } from "./ModelContext";
import { offerTools } from "./offerTools";

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
  offerTools(context, { programs: [aProgram], site, goTo, run });
  return { tools, visited, typed };
}

describe("the tools this site offers an agent in the reader's browser", () => {
  it("are one for each program, described by its summary and its parameters, and one for the prompt", () => {
    const { tools } = aBrowser();
    expect([...tools.keys()]).toEqual(["savings", "shell"]);
    expect(tools.get("savings")?.description).toContain("what a sum grows to, left alone");
    expect(tools.get("savings")?.inputSchema).toMatchObject({ properties: { rate: { type: "number", maximum: 20 } } });
  });

  it("answer a program's call with its words and its figures", async () => {
    const { tools } = aBrowser();
    const answer = await tools.get("savings")!.execute({ years: 0 });
    expect(answer).toContain("100 €");
    expect(answer).toContain('{"grown":100}');
  });

  it("show the reader what the agent asked: they go to the program's page, and its dials move", async () => {
    const { tools, visited } = aBrowser();
    await tools.get("savings")!.execute({ rate: 0 });
    expect(visited).toEqual(["/money/"]);
    expect(document.querySelector(".program-line")?.textContent).toBe("$ savings --rate 0");
    expect(document.querySelector<HTMLInputElement>('input[name="rate"]')?.value).toBe("0");
  });

  it("stay on the page when the program is already on it", async () => {
    const { tools, visited } = aBrowser();
    await tools.get("savings")!.execute({});
    await tools.get("savings")!.execute({ years: 5 });
    expect(visited).toEqual(["/money/"]);
  });

  it("refuse what the program would refuse, and say why, without moving anything", async () => {
    const { tools, visited } = aBrowser();
    expect(await tools.get("savings")!.execute({ rate: 99 })).toBe("Refused, nothing was run: rate: 99 is outside 0 to 20");
    expect(visited).toEqual([]);
  });

  it("run a line at the prompt, where the reader sees it typed, and answer with what it printed", async () => {
    const { tools, typed } = aBrowser();
    const answer = await tools.get("shell")!.execute({ line: "ls" });
    expect(typed).toEqual(["ls"]);
    expect(answer).toBe("README.md money/");
  });
});

describe("a browser with no model context", () => {
  it("is offered nothing, and nothing breaks", () => {
    expect(() => offerTools(undefined, { programs: [aProgram], site, goTo: () => true, run: () => [] })()).not.toThrow();
  });
});
