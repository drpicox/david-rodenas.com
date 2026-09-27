import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import type { Layout } from "./Layout";
import { portfolioCommand } from "./portfolioCommand";

const context = { site: new Site([{ file: "index.md", markdown: "---\ntitle: Home\n---\n" }]), cwd: "/", commands: [] };

function aLayout(on = false): Layout & { asked: string[] } {
  const layout = {
    asked: [] as string[],
    apply(choice: "on" | "off" | "toggle") {
      layout.asked.push(choice);
      on = choice === "toggle" ? !on : choice === "on";
      return on;
    },
  };
  return layout;
}

describe("the portfolio command", () => {
  it("toggles the cards when it is told nothing, and shows both choices with the one it landed on marked", () => {
    const layout = aLayout(false);
    expect(portfolioCommand(layout).run(context, []).text).toBe("portfolio   [on]   off");
    expect(layout.asked).toEqual(["toggle"]);
  });

  it("is told on or off", () => {
    const layout = aLayout(true);
    expect(portfolioCommand(layout).run(context, ["off"]).text).toBe("portfolio   on   [off]");
    expect(layout.asked).toEqual(["off"]);
  });

  it("makes the other choice something to click, which runs the command its title names", () => {
    expect(portfolioCommand(aLayout(false)).run(context, ["on"]).html).toContain('<a href="#" data-run="portfolio off" title="portfolio off">off</a>');
  });

  it("refuses anything else", () => {
    expect(portfolioCommand(aLayout()).run(context, ["maybe"])).toEqual({ text: "portfolio: maybe: choose on or off", error: true });
  });
});
