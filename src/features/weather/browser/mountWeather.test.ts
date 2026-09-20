// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { aWeatherStation, steadyYear } from "../aWeatherStation";
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

  it("opens on tropical nights over the whole year", async () => {
    const host = await mounted();
    expect(host.querySelector("figcaption")?.textContent).toContain("daily minimum of 20 °C or more, whole year");
    expect(host.querySelector(".figures strong")?.textContent).toBe("365");
  });

  it("counts again, without asking anyone anything, when the threshold slides", async () => {
    const host = await mounted();
    const fetches = vi.fn();
    vi.stubGlobal("fetch", fetches);
    const slider = host.querySelector('input[type="range"]') as HTMLInputElement;
    slider.value = "25";
    slider.dispatchEvent(new Event("input"));
    expect(host.querySelector("figcaption")?.textContent).toContain("25 °C or more");
    expect(host.querySelector(".figures strong")?.textContent).toBe("0");
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

  it("looks at a season when asked", async () => {
    const host = await mounted();
    const months = host.querySelectorAll("select")[2] as HTMLSelectElement;
    months.value = "1";
    months.dispatchEvent(new Event("change"));
    expect(host.querySelector("figcaption")?.textContent).toContain("June to August");
    expect(host.querySelector(".figures strong")?.textContent).toBe("92");
  });
});
