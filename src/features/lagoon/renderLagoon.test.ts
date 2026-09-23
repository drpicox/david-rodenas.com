import { describe, expect, it } from "vitest";
import { renderLagoon } from "./renderLagoon";
import { starters } from "./starters";
import { Tournament } from "./Tournament";

describe("the lagoon's board", () => {
  it("says what is in the lagoon before anyone has been out", () => {
    const html = renderLagoon(new Tournament(19, 10, [starters.one]));
    expect(html).toContain("19 fish");
    expect(html).toContain("One");
  });

  it("shows the last round week by week: what each bot caught, and what was left to breed", () => {
    const season = new Tournament(19, 3, [starters.one, starters.power]);
    season.play();
    const html = renderLagoon(season);
    // Week 1: One took 1 and Power 0; 18 bred to 27.
    expect(html).toMatch(/<tr[^>]*>.*One.*<td[^>]*>1<\/td>.*<\/tr>/s);
    expect(html).toMatch(/lagoon.*27/s);
  });

  it("ranks the bots by the season's total, round after round, and says when one broke", () => {
    const broken = { name: "Broken", orders: () => JSON.parse("{") as number[] };
    const season = new Tournament(19, 3, [broken, starters.one]);
    season.play();
    season.play();
    const html = renderLagoon(season);
    const standings = html.slice(html.indexOf('class="board"'));
    expect(standings.indexOf("One")).toBeLessThan(standings.indexOf("Broken"));
    expect(standings).toMatch(/Broken.*JSON/s);
    expect(html).toContain("2 rounds");
  });
});
