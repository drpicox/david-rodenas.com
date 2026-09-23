import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

/** The method as TypeScript has it, less what only TypeScript reads: the types and the `!`s. */
function asJavaScript(source: string, method: string): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`  ${method}(`));
  const end = lines.findIndex((line, at) => at > start && line === "  }");
  return lines
    .slice(start, end + 1)
    .map((line) => line.slice(2))
    .join("\n")
    .replace(/\(input: readonly number\[\], target: readonly number\[\], rate: number\): number/, "(input, target, rate)")
    .replace(/!(?!=)/g, "");
}

describe("the page about the first network", () => {
  it("prints the learning as it runs, not a copy that has drifted from it", () => {
    const page = read("../../../content/projects/first-network.md");
    const shown = /## The code[\s\S]*?```js\n([\s\S]*?)\n```/.exec(page)?.[1];
    expect(shown).toBe(asJavaScript(read("./Network.ts"), "learn"));
  });
});
