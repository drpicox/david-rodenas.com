import { describe, expect, it } from "vitest";
import { foldedOf } from "./foldedOf";

describe("a text as a search reads it", () => {
  it("is in small letters and without accents, so that salva finds Salvà and Ebre finds l'EBRE", () => {
    expect(foldedOf("Francesc Salvà, l'EBRE, Àneu, Muñoz")).toBe("francesc salva, l'ebre, aneu, munoz");
  });

  it("keeps a letter for every letter, so that what is found in it can be marked in the text it came from", () => {
    const text = "Pàgina d'Ín­dex — 2026 ✓";
    expect(foldedOf(text).length).toBe(text.length);
  });
});
