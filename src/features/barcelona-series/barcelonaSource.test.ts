import { describe, expect, it } from "vitest";
import { barcelonaSource } from "./barcelonaSource";

describe("Barcelona's temperature since 1780, as the site keeps it", () => {
  it("is the file of mean temperatures, from 1780, credited to its own paper", () => {
    expect(barcelonaSource).toMatchObject({ name: "barcelona-series", firstYear: 1780, files: ["temperature.json"] });
    expect(barcelonaSource.about["attribution"]).toContain("Prohom, Barriendos, Aguilar and Ripoll, 2012");
    expect(barcelonaSource.follow?.('<a href="https://x.test/Barcelona_PPT_m_1786_2025.txt"><a href="https://x.test/Barcelona_TM_m_1780_2025.txt">')).toBe("https://x.test/Barcelona_TM_m_1780_2025.txt");
  });
});
