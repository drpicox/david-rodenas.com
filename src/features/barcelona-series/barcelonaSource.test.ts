import { describe, expect, it } from "vitest";
import { barcelonaAnswer } from "./barcelonaAnswer";
import { barcelonaSource } from "./barcelonaSource";

const TWELVE = [6.7, 7.3, 11.6, 11.4, 16.3, 19.1, 21.4, 22, 20.3, 16.3, 9.2, 7.3];

describe("Barcelona's series since 1780, from the Meteocat to the site", () => {
  it("is asked of the Meteocat's page, and followed to the file the page links to", () => {
    expect(barcelonaSource.requestsFor(1780, new Date("2026-10-08"))).toEqual(["https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/serie-climatica-de-barcelona-des-de-1780/"]);
    expect(barcelonaSource.follow?.('<a href="https://static-m.meteo.cat/x/Barcelona_TM_m_1780_2025.txt">')).toBe("https://static-m.meteo.cat/x/Barcelona_TM_m_1780_2025.txt");
  });

  it("keeps a year as its twelve monthly means, added to what the file held", () => {
    const answer = barcelonaAnswer({ 1780: TWELVE, 1781: TWELVE.map((month) => month + 1) });
    const first = barcelonaSource.withYear({}, 1780, [answer]);
    const both = barcelonaSource.withYear(first, 1781, [answer]);
    expect(both["temperature.json"]?.years).toEqual({ 1780: TWELVE, 1781: TWELVE.map((month) => month + 1) });
  });

  it("waits for a year the series does not reach yet", () => {
    expect(() => barcelonaSource.withYear({}, 2026, [barcelonaAnswer({ 2025: TWELVE })])).toThrow(/does not reach 2026 yet/);
  });

  it("has no year still running: the Meteocat adds a whole year at a time", () => {
    expect(barcelonaSource.soFar).toBeUndefined();
  });
});
