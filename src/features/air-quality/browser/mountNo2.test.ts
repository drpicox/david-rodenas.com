// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { aStation, flatSums } from "../aStation";
import { mountNo2 } from "./mountNo2";

const station = aStation({
  "2019": { workdays: flatSums(60, 20), weekends: flatSums(30, 8) },
  "2020": { workdays: flatSums(20, 20), weekends: flatSums(10, 8) },
});
const index = { attribution: "Whoever measured", dataset: "https://example.test", years: [2019, 2020], refreshed: "2026-09-20" };

function served(): void {
  vi.stubGlobal("fetch", async (url: string) => ({ json: async () => (url.endsWith("index.json") ? index : station) }));
}
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => vi.unstubAllGlobals());

describe("the NO2 figure, once the script is there", () => {
  it("draws the station's whole record, and says whose data it is, on a page that arrived with no still", async () => {
    served();
    const host = document.createElement("div");
    mountNo2(host);
    await settled();
    expect(host.querySelector("figcaption")?.textContent).toContain("2019–2020");
    expect(host.querySelector("p.source")?.textContent).toContain("Whoever measured");
  });

  it("keeps the still's own source line rather than asking for it again", async () => {
    served();
    const host = document.createElement("div");
    host.innerHTML = '<figure class="no2">still</figure><p class="source">written by the build</p>';
    mountNo2(host);
    await settled();
    expect(host.querySelectorAll("p.source")).toHaveLength(1);
    expect(host.querySelector("p.source")?.textContent).toBe("written by the build");
    expect(host.querySelector("figure")?.textContent).not.toBe("still");
  });

  it("looks at one year alone when its bar is pressed, and at all of them again when asked", async () => {
    served();
    const host = document.createElement("div");
    mountNo2(host);
    await settled();
    host.querySelector('.hit[data-year="2020"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.querySelector("figcaption")?.textContent).toContain(", 2020");
    expect(host.querySelector("td")?.textContent).toBe("17");
    host.querySelector("button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.querySelector("figcaption")?.textContent).toContain("2019–2020");
  });

  it("averages only the days asked for", async () => {
    served();
    const host = document.createElement("div");
    mountNo2(host);
    await settled();
    const days = host.querySelectorAll("select")[1] as HTMLSelectElement;
    days.value = "weekends";
    days.dispatchEvent(new Event("change"));
    expect(host.querySelector("td")?.textContent).toBe("20");
  });

  it("says so, and leaves the page alone, when the measurements do not arrive", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new Error("offline");
    });
    const host = document.createElement("div");
    mountNo2(host);
    await settled();
    expect(host.textContent).toContain("did not arrive");
  });
});
