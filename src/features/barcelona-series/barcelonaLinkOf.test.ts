import { describe, expect, it } from "vitest";
import { barcelonaLinkOf } from "./barcelonaLinkOf";

/** The Meteocat's page as it links the two files of the series, the rain's after the temperature's. */
const PAGE = [
  '<p><strong><a href="https://static-m.meteo.cat/wordpressweb/wp-content/uploads/2026/01/13162130/Barcelona_TM_m_1780_2025.txt" target="_blank" rel="noreferrer noopener">Temperatura</a></strong></p>',
  '<p><strong><a href="https://static-m.meteo.cat/wordpressweb/wp-content/uploads/2026/01/13162130/Barcelona_PPT_m_1786_2025.txt" target="_blank" rel="noreferrer noopener">Precipitació</a></strong></p>',
].join("\n\n");

describe("where the Meteocat keeps Barcelona's series this year", () => {
  it("is the file of monthly mean temperatures the page links to, whatever it is called this year", () => {
    expect(barcelonaLinkOf(PAGE)).toBe("https://static-m.meteo.cat/wordpressweb/wp-content/uploads/2026/01/13162130/Barcelona_TM_m_1780_2025.txt");
  });

  it("is nowhere, said so, when the page no longer links to one", () => {
    expect(() => barcelonaLinkOf("<html><body>Manteniment</body></html>")).toThrow(/no longer links/);
  });
});
