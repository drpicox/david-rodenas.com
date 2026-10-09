import { describe, expect, it } from "vitest";
import { barcelonaRainSource } from "./barcelonaRainSource";

describe("Barcelona's rain since 1786, as the site keeps it", () => {
  it("is the file of rain, from 1786, kept apart from the temperatures and credited to its own paper", () => {
    expect(barcelonaRainSource).toMatchObject({ name: "barcelona-rain", firstYear: 1786, directory: "public/data/barcelona-rain", files: ["rain.json"] });
    expect(barcelonaRainSource.about["attribution"]).toContain("Prohom, Barriendos and Sanchez-Lorenzo, 2015");
    expect(barcelonaRainSource.follow?.('<a href="https://x.test/Barcelona_TM_m_1780_2025.txt"><a href="https://x.test/Barcelona_PPT_m_1786_2025.txt">')).toBe("https://x.test/Barcelona_PPT_m_1786_2025.txt");
  });
});
