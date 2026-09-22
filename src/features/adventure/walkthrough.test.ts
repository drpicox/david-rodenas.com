import { describe, expect, it } from "vitest";
import { Adventure } from "./Adventure";

/** One way through, found by hand on the map: every key, the two named weapons, and the last blow taken with nothing to spare. */
export const walkthrough = `coger este coger norte atacar coger este
norte oeste atacar coger este este atacar coger sur atacar coger sur atacar coger norte este
sur este este este norte norte oeste atacar coger
sur este sur atacar coger norte oeste norte
sur este sur oeste oeste norte atacar coger
sur este este norte oeste norte oeste coger este norte
oeste oeste coger este atacar coger este este atacar coger oeste oeste oeste norte
este atacar este norte norte oeste atacar coger este este norte atacar coger oeste oeste atacar coger
oeste sur oeste norte oeste sur oeste norte atacar coger
oeste sur sur atacar coger sur sur este norte atacar coger norte este atacar coger sur sur este atacar coger
oeste norte norte oeste sur sur oeste norte norte norte norte este sur este norte este sur este sur este este sur oeste oeste sur este este sur sur este sur oeste oeste oeste norte oeste norte oeste oeste oeste sur`;

describe("the whole game", () => {
  it("can be finished, and its last fight costs exactly the life there is", () => {
    const game = new Adventure();
    for (const word of walkthrough.split(/\s+/).filter(Boolean)) game.run(word);
    expect(game.won).toBe(true);
    expect(game.look().name).toBe("Despensa");
    expect(game.look().life).toBe(0);
    expect(game.look()).toMatchObject({ weapon: "Thurmei", shield: "Rharmei" });
  });

  it("can be saved and loaded halfway, and the loaded game goes on to the same end", () => {
    const words = walkthrough.split(/\s+/).filter(Boolean);
    const first = new Adventure();
    for (const word of words.slice(0, 60)) first.run(word);
    const second = Adventure.load(first.save());
    expect(second.look()).toEqual(first.look());
    for (const word of words.slice(60)) second.run(word);
    expect(second.won).toBe(true);
  });
});
