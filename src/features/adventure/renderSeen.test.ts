import { describe, expect, it } from "vitest";
import { Adventure } from "./Adventure";
import { renderSeen } from "./renderSeen";

describe("what the player sees", () => {
  it("is what the game printed, in its own words and order", () => {
    const html = renderSeen(new Adventure().look());
    expect(html).toContain("===== Welcome =====");
    expect(html).toContain("There is: newspaper");
    expect(html).toContain('<p class="status">(0,0)|  16&gt;</p>');
  });

  it("shows what is in the room beside the words for it", () => {
    expect(renderSeen(new Adventure().look())).toMatch(/<p class="item"><svg class="pixel"[^]*There is: newspaper/);
  });

  it("shows what the player carries, and how much life is left, as pictures", () => {
    const game = new Adventure();
    game.take();
    const html = renderSeen(game.look());
    expect(html).toMatch(/<p class="gear">[^]*<svg class="pixel"[^]*newspaper/);
    expect(html.match(/class="heart full"/g)).toHaveLength(16);
  });
});
