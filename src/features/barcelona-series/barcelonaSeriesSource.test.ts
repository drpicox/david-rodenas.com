import { describe, expect, it } from "vitest";
import { barcelonaAnswer } from "./barcelonaAnswer";
import { barcelonaSeriesSource } from "./barcelonaSeriesSource";

const RAIN = [136.4, 27.4, 44.6, 76.9, 0, 29.8, 34.7, 14.9, 205.8, 12.4, 42.2, 0];
const PAGE = '<a href="https://static-m.meteo.cat/x/Barcelona_TM_m_1780_2025.txt"> <a href="https://static-m.meteo.cat/x/Barcelona_PPT_m_1786_2025.txt">';
const rain = barcelonaSeriesSource({ name: "barcelona-rain", file: "PPT", kept: "rain.json", firstYear: 1786, measures: "rain", attribution: "Whoever measured it." });

describe("one of Barcelona's series, from the Meteocat to the site", () => {
  it("is asked of the Meteocat's page, and followed to the file of its kind the page links to this year", () => {
    expect(rain.requestsFor(1786, new Date("2026-10-09"))).toEqual(["https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/serie-climatica-de-barcelona-des-de-1780/"]);
    expect(rain.follow?.(PAGE)).toBe("https://static-m.meteo.cat/x/Barcelona_PPT_m_1786_2025.txt");
  });

  it("is kept in a directory of its own, credited as it asks to be", () => {
    expect(rain).toMatchObject({ directory: "public/data/barcelona-rain", files: ["rain.json"], about: { attribution: "Whoever measured it." } });
  });

  it("keeps a year as its twelve monthly values, added to what the file held, nothing for a month it has none for", () => {
    const answer = barcelonaAnswer({ 1786: [null, null, null, null, null, null, 6.8, 52.1, 62, 57, 195.8, 114.1], 1787: RAIN });
    const both = rain.withYear(rain.withYear({}, 1786, [answer]), 1787, [answer]);
    expect(both["rain.json"]?.years).toEqual({ 1786: [null, null, null, null, null, null, 6.8, 52.1, 62, 57, 195.8, 114.1], 1787: RAIN });
  });

  it("waits for a year the series does not reach yet, and has no year still running: the Meteocat adds a whole year at a time", () => {
    expect(() => rain.withYear({}, 2026, [barcelonaAnswer({ 2025: RAIN })])).toThrow(/does not reach 2026 yet/);
    expect(rain.soFar).toBeUndefined();
  });
});
