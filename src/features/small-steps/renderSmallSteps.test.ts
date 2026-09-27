import { describe, expect, it } from "vitest";
import { renderSmallSteps } from "./renderSmallSteps";

describe("the row of small steps", () => {
  it("is one mark a place, each as it stands", () => {
    const html = renderSmallSteps(["green", "clean", "red", "empty"]);
    expect(html.match(/<li /g)).toHaveLength(4);
    expect(html).toContain('<li class="green"></li><li class="clean"></li><li class="red"></li><li class="empty"></li>');
  });

  it("says in words what it shows, for whoever cannot see it", () => {
    expect(renderSmallSteps([])).toContain('role="img" aria-label="Small steps: a test fails and is put right at once; clean steps between; again and again"');
  });
});
