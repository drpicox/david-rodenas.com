// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { aWeatherStation } from "../aWeatherStation";
import { steadyYear } from "../steadyYear";
import { askProgram } from "../../../platform/browser/askProgram";
import { mountWeather } from "./mountWeather";

const station = aWeatherStation({ "2022": steadyYear(2022, 21), "2023": steadyYear(2023, 21), "2024": steadyYear(2024, 26), "2025": steadyYear(2025, 26) });
const index = { attribution: "Whoever measured", dataset: "https://example.test", years: [2022, 2025], refreshed: "2026-09-20" };
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => vi.unstubAllGlobals());

describe("the weather figure, once the script is there", () => {
  async function mounted(): Promise<HTMLElement> {
    vi.stubGlobal("fetch", async (url: string) => ({ json: async () => (url.endsWith("index.json") ? index : station) }));
    const host = document.createElement("div");
    mountWeather(host);
    await settled();
    return host;
  }

  it("opens on torrid nights over the whole year, and says so in its list", async () => {
    const host = await mounted();
    expect(host.querySelector("figcaption")?.textContent).toContain("daily minimum of 25 °C or more, whole year");
    expect([...host.querySelectorAll(".figures strong")].map((figure) => figure.textContent)).toEqual(["0", "365.5", "+365.5"]);
    expect((host.querySelectorAll("select")[1] as HTMLSelectElement).value).toBe("torrid-nights");
  });

  it("counts again, without asking anyone anything, when the threshold slides", async () => {
    const host = await mounted();
    const fetches = vi.fn();
    vi.stubGlobal("fetch", fetches);
    const slider = host.querySelector('input[type="range"]') as HTMLInputElement;
    slider.value = "20";
    slider.dispatchEvent(new Event("input"));
    expect(host.querySelector("figcaption")?.textContent).toContain("20 °C or more");
    expect(host.querySelector(".figures strong")?.textContent).toBe("365");
    expect(fetches).not.toHaveBeenCalled();
  });

  it("changes what kind of day is counted, threshold and all, from the shortcuts", async () => {
    const host = await mounted();
    const presets = host.querySelectorAll("select")[1] as HTMLSelectElement;
    presets.value = "frost-days";
    presets.dispatchEvent(new Event("change"));
    expect(host.querySelector("figcaption")?.textContent).toContain("below 0 °C");
    expect(host.querySelector("output")?.textContent).toBe("below 0 °C");
  });

  it("draws the year still running apart, and says how far it reaches, when the site has it", async () => {
    const running = { year: 2026, through: "2026-09-28", refreshed: "2026-09-30", files: { "WU.json": aWeatherStation({ "2026": steadyYear(2026, 21, [9, 10, 11]) }) } };
    vi.stubGlobal("fetch", async (url: string) => ({
      ok: true,
      text: async () => JSON.stringify(running),
      json: async () => (url.endsWith("index.json") ? index : station),
    }));
    const host = document.createElement("div");
    mountWeather(host);
    await settled();
    expect(host.querySelector('.bar.running[data-year="2026"]')).not.toBeNull();
    expect(host.querySelector("p.source")?.textContent).toContain("2026 so far, to 28 September");
  });

  it("offers the Meteocat's long series beside its stations, and credits the one chosen to the source it is kept from", async () => {
    const asked: string[] = [];
    const seriesIndex = { ...index, attribution: "Servei Meteorològic de Catalunya, CADTEP." };
    vi.stubGlobal("fetch", async (url: string) => {
      asked.push(url);
      return { ok: true, text: async () => "", json: async () => (url === "/data/climate-series/index.json" ? seriesIndex : url.endsWith("index.json") ? index : station) };
    });
    const host = document.createElement("div");
    mountWeather(host);
    await settled();
    const stations = host.querySelector("select") as HTMLSelectElement;
    expect([...stations.querySelectorAll("optgroup")].map((group) => group.label)).toEqual(["Automatic stations", "Long series, since 1950"]);

    stations.value = "baic0008";
    stations.dispatchEvent(new Event("change"));
    await settled();
    expect(asked).toContain("/data/climate-series/baic0008.json");
    expect(asked).not.toContain("/data/climate-series/running.json");
    expect(host.querySelector("p.source")?.textContent).toContain("CADTEP");

    stations.value = "WU";
    stations.dispatchEvent(new Event("change"));
    await settled();
    expect(host.querySelectorAll("p.source").length).toBe(1);
    expect(host.querySelector("p.source")?.textContent).toContain("Whoever measured");
  });

  it("answers an agent's question where the reader sees it: the station, the kind of day, the threshold and the months", async () => {
    const host = await mounted();
    askProgram(host, { station: "WU", kind: "torrid-nights", threshold: 25.5, months: "5,6,7" });
    await settled();
    expect(host.querySelector("figcaption")?.textContent).toContain("daily minimum of 25.5 °C or more, June to August");
    expect((host.querySelectorAll("select")[1] as HTMLSelectElement).value).toBe("torrid-nights");
    expect((host.querySelectorAll("select")[2] as HTMLSelectElement).value).toBe("1");
    expect(host.querySelector("output")?.textContent).toBe("25.5 °C or more");
  });

  it("looks at a season when asked", async () => {
    const host = await mounted();
    const months = host.querySelectorAll("select")[2] as HTMLSelectElement;
    months.value = "1";
    months.dispatchEvent(new Event("change"));
    expect(host.querySelector("figcaption")?.textContent).toContain("June to August");
    expect(host.querySelectorAll(".figures strong")[1]?.textContent).toBe("92");
  });
});
