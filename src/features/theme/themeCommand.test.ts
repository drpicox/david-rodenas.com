import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import type { ShellContext } from "../../platform/shell/Command";
import { siteCommands } from "../../platform/shell/commands/siteCommands";
import type { Theme } from "./Theme";
import type { ThemeChoice } from "./ThemeChoice";
import { themeCommand } from "./themeCommand";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n" },
  { file: "worlds/index.md", markdown: "---\ntitle: Worlds\ntheme: dark\n---\n" },
]);

/** A theme that keeps its answer in a variable, which is all a test needs one to do. */
function fakeTheme(): Theme & { asked: ThemeChoice[]; settled: "light" | "dark" | "system" } {
  const fake = {
    asked: [] as ThemeChoice[],
    settled: "dark" as "light" | "dark" | "system",
    apply(choice: ThemeChoice) {
      fake.asked.push(choice);
      return fake.settled;
    },
  };
  return fake;
}

function run(theme: Theme, cwd: string, args: readonly string[]) {
  const context: ShellContext = { site, cwd, commands: siteCommands };
  return themeCommand(theme).run(context, args);
}

describe("theme", () => {
  it("asks for a toggle when it is given nothing, and says what it became", () => {
    const theme = fakeTheme();
    expect(run(theme, "/", []).text).toBe("theme: dark");
    expect(theme.asked).toEqual(["toggle"]);
  });

  it("passes a named choice straight through", () => {
    const theme = fakeTheme();
    theme.settled = "light";
    expect(run(theme, "/", ["light"]).text).toBe("theme: light");
    expect(theme.asked).toEqual(["light"]);
  });

  it("takes auto to mean the system's choice", () => {
    const theme = fakeTheme();
    theme.settled = "system";
    expect(run(theme, "/", ["auto"]).text).toBe("theme: system");
    expect(theme.asked).toEqual(["system"]);
  });

  it("refuses a choice that is not one, and does not touch the page", () => {
    const theme = fakeTheme();
    const outcome = run(theme, "/", ["puce"]);
    expect(outcome.error).toBe(true);
    expect(outcome.text).toContain("puce");
    expect(theme.asked).toEqual([]);
  });

  // A page that insists on dark is dark for a reason; the reader's choice waits outside it.
  it("refuses on a page that keeps its own, and says which", () => {
    const theme = fakeTheme();
    const outcome = run(theme, "/worlds/", []);
    expect(outcome.error).toBe(true);
    expect(outcome.text).toContain("dark");
    expect(theme.asked).toEqual([]);
  });
});
